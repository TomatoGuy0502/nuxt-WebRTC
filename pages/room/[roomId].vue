<script setup lang="ts">
import '@unocss/reset/tailwind-compat.css'

const route = useRoute()
const peerStore = usePeerStore()
const { remoteStream, isRoomExist, isCheckingRoomExist, mediaConnection } = storeToRefs(peerStore)

const { cameras, microphones, speakers, currentCamera, currentMicrophone, currentSpeaker, supportChangeAudioOutput, initCurrentDevices } = useDevices()

const myVideoEl = ref<HTMLVideoElement>()
const remoteVideoEl = ref<HTMLVideoElement>()
const canvasEl = ref<HTMLCanvasElement>()

const location = window.location

// Check if the user is the creator of the room
const isCreater = computed(() => route.params.roomId === peerStore.peerId)

// Show the last frame of the video stream when switching devices
const showCanvas = ref(false)

// Control the camera and microphone
const isCameraOn = ref(true)
const isMicOn = ref(true)

const { stream: toRemoteStream } = useUserMedia({
  enabled: true,
  autoSwitch: false,
  constraints: {
    video: { aspectRatio: 16 / 9 },
    audio: {},
  },
})
watch(toRemoteStream, () => {
  initCurrentDevices(toRemoteStream.value!)
}, { once: true })
onMounted(async () => {
  await peerStore.checkRoomStatus(toRemoteStream)
})

function removeTrack(stream: MediaStream, kind: 'audio' | 'video') {
  stream.getTracks().filter(track => track.kind === kind).forEach((track) => {
    track.stop()
    stream.removeTrack(track)
  })
}

async function changeDeviceTrack(deviceId: string, kind: 'audio' | 'video', enabled: boolean = true) {
  // Create a new track and replace the old one
  const tempStream = await navigator.mediaDevices.getUserMedia(kind === 'video'
    ? { video: { deviceId } }
    : { audio: { deviceId } },
  )
  const newTrack = tempStream.getTracks()[0].clone()
  newTrack.enabled = enabled

  if (kind === 'video')
    handleCanvasTransition()

  // Change the streamTrack sent to the remote peer first
  peerStore.changeMediaStreamTrack(newTrack, kind)

  // Then change the streamTrack displayed on the screen
  removeTrack(toRemoteStream.value!, kind)
  toRemoteStream.value!.addTrack(newTrack)

  if (kind === 'video')
    showCanvas.value = false
  tempStream.getTracks().forEach(track => track.stop())
}

watch(currentCamera, async (newDeviceId, oldDeviceId) => {
  if (!oldDeviceId || !newDeviceId)
    return
  // Change stream sent to remote peer
  await changeDeviceTrack(newDeviceId, 'video', isCameraOn.value)
})

watch(currentMicrophone, async (newDeviceId, oldDeviceId) => {
  if (!oldDeviceId || !newDeviceId)
    return
  await changeDeviceTrack(newDeviceId, 'audio', isMicOn.value)
})

// Handle audio output change
if (supportChangeAudioOutput.value) {
  watch(currentSpeaker, (newDeviceId, oldDeviceId) => {
    if (!oldDeviceId || !newDeviceId)
      return
    (remoteVideoEl.value as any).setSinkId(newDeviceId)
  })
}

function toggleCamera() {
  isCameraOn.value = !isCameraOn.value
  if (toRemoteStream.value)
    toRemoteStream.value.getVideoTracks()[0].enabled = isCameraOn.value
}

function toggleMuteMyself() {
  isMicOn.value = !isMicOn.value
  if (toRemoteStream.value)
    toRemoteStream.value.getAudioTracks()[0].enabled = isMicOn.value
}

// Draw the last frame of the video stream into the canvas, preventing the video from disappearing when switching devices
function handleCanvasTransition() {
  if (isCameraOn.value) {
    const ctx = canvasEl.value!.getContext('2d')!
    ctx.drawImage(myVideoEl.value!, 0, 0, 640, 360)
    showCanvas.value = true
  }
}

function handleHangup() {
  peerStore.hangup()
  toRemoteStream.value?.getTracks().forEach(track => track.stop())
  toRemoteStream.value = undefined
  useRouter().push('/')
}
</script>

<template>
  <div class="h-dvh bg-gray-50 flex flex-col bg-pattern p-4 gap-4">
    <nav class="relative z-1 flex p-4 gap-4 bg-gray-700/20 rounded-lg backdrop-blur-sm backdrop-filter">
      <a href="/" class="flex items-center gap-2 font-black text-4xl text-white">
        <div class="i-tabler-home w-10 h-10" />
      </a>
      <QRCodePopover class="ml-auto" />
      <CopyButton :copy-text="location.href" show-text="Link" />
      <CopyButton :copy-text="$route.params.roomId as string" show-text="ID" />
      <a
        v-if="isCreater"
        class="hidden lg:flex items-center gap-2 p-2 px-4 rounded-lg transition text-white"
        :class="[!!mediaConnection ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-300 hover:(bg-orange-400)']"
        :href="$route.fullPath"
        target="_blank"
        @click="!!mediaConnection && $event.preventDefault()"
      >
        <div class="i-tabler-external-link w-5 h-5 mt-0.5" />
        <span v-if="!mediaConnection" class="font-bold">Join in new tab</span>
        <span v-else class="font-bold">Room is full now</span>
      </a>
    </nav>
    <div v-if="isCheckingRoomExist" class="flex flex-1 p-4 gap-1 justify-center items-center bg-gray-700/20 rounded-lg backdrop-blur-sm backdrop-filter text-2xl">
      <div class="i-tabler-loader w-8 h-8 animate-[spin_3s_linear_infinite]" />
      正在將您引導至房間
    </div>
    <div v-else-if="!isRoomExist" class="flex flex-1 p-4 justify-center items-center bg-gray-700/20 rounded-lg backdrop-blur-sm backdrop-filter text-2xl">
      房間不存在，<NuxtLink to="/" class="underline">
        {{ '返回主頁面' }}
      </NuxtLink>
    </div>
    <div v-else class="relative gap-4 flex-1 max-md:(grid grid-rows-2 overflow-hidden) md:(flex)" :class="{ 'flex-row-reverse': !isCreater }">
      <div class="flex-1 flex p-4 justify-center items-center bg-gray-700/20 rounded-lg backdrop-blur-sm backdrop-filter relative md:max-lg:(absolute w-2/5 z-1 bottom-0 right-0 flex-row-reverse p-2)">
        <div class="flex gap-2 p-2 lg:(px-4 gap-4) absolute bottom-4 left-1/2 -translate-x-1/2 z-1 rounded-lg bg-gray-700/20 md:max-lg:(relative bottom-0 left-0 translate-x-0 flex-col ml-2)">
          <ToggleButton :is-on="isMicOn" is-on-icon="i-tabler-microphone" is-off-icon="i-tabler-microphone-off" @toggle="toggleMuteMyself" />
          <ToggleButton :is-on="isCameraOn" is-on-icon="i-tabler-video" is-off-icon="i-tabler-video-off" @toggle="toggleCamera" />
          <SettingModal
            v-model:currentCamera="currentCamera"
            v-model:currentMicrophone="currentMicrophone"
            v-model:currentSpeaker="currentSpeaker"
            :cameras="cameras" :microphones="microphones" :speakers="speakers"
          />
          <HangupModal @confirm="handleHangup" />
        </div>
        <div class="relative overflow-hidden rounded-lg aspect-video h-full flex items-center md:(w-full)">
          <transition
            enter-active-class="transition duration-100 ease-in"
            enter-from-class="opacity-0"
          >
            <video
              v-show="isCameraOn" ref="myVideoEl" muted
              playsinline autoplay :srcObject="toRemoteStream" class="aspect-video w-full rounded-lg"
            />
          </transition>
          <transition
            leave-active-class="transition duration-100 ease-in"
            leave-to-class="opacity-0"
          >
            <div v-show="!isCameraOn || !toRemoteStream" class="bg-gray-700/40 rounded-lg absolute grid place-items-center select-none aspect-video w-full">
              鏡頭尚未開啟
            </div>
          </transition>
          <canvas v-show="showCanvas" ref="canvasEl" width="640" height="360" class="absolute top-0 w-full" />
        </div>
      </div>
      <div class="flex-1 flex p-4 justify-center items-center bg-gray-700/20 rounded-lg backdrop-blur-sm backdrop-filter">
        <div class="relative overflow-hidden rounded-lg aspect-video flex h-full items-center md:(w-full)">
          <video
            ref="remoteVideoEl"
            playsinline autoplay :srcObject="remoteStream" class="aspect-video w-full rounded-lg"
          />
          <div v-if="!remoteStream" class="bg-gray-700/40 rounded-lg absolute grid place-items-center select-none aspect-video w-full">
            對方尚未連接
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

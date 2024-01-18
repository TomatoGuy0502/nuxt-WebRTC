<script setup lang="ts">
import '@unocss/reset/tailwind-compat.css'

const route = useRoute()
const peerStore = usePeerStore()
const { remoteStream, isRoomExist, isCheckingRoomExist } = storeToRefs(peerStore)

const { cameras, microphones, speakers, currentCamera, currentMicrophone, currentSpeaker, supportChangeAudioOutput } = useDevices()

const myVideoEl = ref<HTMLVideoElement>()
const remoteVideoEl = ref<HTMLVideoElement>()
const canvasEl = ref<HTMLCanvasElement>()

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

await peerStore.checkRoomStatus(toRemoteStream)

function removeTrack(stream: MediaStream, kind: 'audio' | 'video') {
  stream.getTracks().filter(track => track.kind === kind).forEach((track) => {
    track.stop()
    stream.removeTrack(track)
  })
}

async function changeDeviceTrack(deviceId: string, kind: 'audio' | 'video', enabled: boolean = true) {
  // Create a new track and replace the old one
  const tempStream = await navigator.mediaDevices.getUserMedia(kind === 'video'
    ? { video: { deviceId, width: 640, height: 360 } }
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

function handleCopyLink() {
  navigator.clipboard.writeText(window.location.href)
}
</script>

<template>
  <div class="h-dvh bg-gray-50 flex flex-col bg-pattern p-4 gap-4">
    <nav class="flex p-4 gap-4 bg-gray-700/20 rounded-lg backdrop-blur-sm backdrop-filter">
      <a href="/" class="font-black text-4xl text-white">
        WebRTC Playground
      </a>
      <button v-if="isCreater" class="ml-auto flex items-center gap-2 p-2 px-4 rounded-lg bg-orange-300 transition text-white hover:(bg-orange-400)" @click="handleCopyLink">
        <div class="i-tabler-copy w-5 h-5 mt-0.5" />
        <span class="font-bold">Copy Link</span>
      </button>
      <!-- TODO: Hide the button when the room is full -->
      <a v-if="isCreater" class="flex items-center gap-2 p-2 px-4 rounded-lg bg-orange-300 transition text-white hover:(bg-orange-400)" :href="$route.fullPath" target="_blank">
        <div class="i-tabler-external-link w-5 h-5 mt-0.5" />
        <span class="font-bold">Join the room in new tab</span>
      </a>
    </nav>
    <div v-if="isCheckingRoomExist" class="flex flex-1 p-4 justify-center items-center bg-gray-700/20 rounded-lg backdrop-blur-sm backdrop-filter text-2xl">
      正在將你引導至房間...
    </div>
    <div v-else-if="!isRoomExist" class="flex flex-1 p-4 justify-center items-center bg-gray-700/20 rounded-lg backdrop-blur-sm backdrop-filter text-2xl">
      房間不存在，<NuxtLink to="/" class="underline">
        {{ '返回主頁面' }}
      </NuxtLink>
    </div>
    <div v-else class="flex gap-4 flex-1" :class="{ 'flex-row-reverse': !isCreater }">
      <div class="flex-1 flex p-4 justify-center items-center bg-gray-700/20 rounded-lg backdrop-blur-sm backdrop-filter relative">
        <div class="flex gap-4 p-2 px-4 absolute bottom-4 left-1/2 -translate-x-1/2 z-1 rounded-lg bg-gray-700/20">
          <button
            class="p-4 text-white rounded-full transition"
            :class="isMicOn ? 'bg-black/20 hover:(bg-black/30)' : 'bg-red-400 hover:(bg-red-500)'"
            @click="toggleMuteMyself"
          >
            <div v-show="isMicOn" class="i-tabler-microphone w-8 h-8" />
            <div v-show="!isMicOn" class="i-tabler-microphone-off w-8 h-8" />
          </button>
          <button
            class="p-4 text-white rounded-full transition"
            :class="isCameraOn ? 'bg-black/20 hover:(bg-black/30)' : 'bg-red-400 hover:(bg-red-500)'"
            @click="toggleCamera"
          >
            <div v-show="isCameraOn" class="i-tabler-video w-8 h-8" />
            <div v-show="!isCameraOn" class="i-tabler-video-off w-8 h-8" />
          </button>
          <SettingModal
            v-model:currentCamera="currentCamera"
            v-model:currentMicrophone="currentMicrophone"
            v-model:currentSpeaker="currentSpeaker"
            :cameras="cameras" :microphones="microphones" :speakers="speakers"
          />
        </div>
        <div class="relative overflow-hidden rounded-lg aspect-video w-full">
          <transition
            enter-active-class="transition duration-100 ease-in"
            enter-from-class="opacity-0"
          >
            <video
              v-show="isCameraOn" ref="myVideoEl" muted
              playsinline autoplay :srcObject="toRemoteStream" class="aspect-video w-full"
            />
          </transition>
          <transition
            leave-active-class="transition duration-100 ease-in"
            leave-to-class="opacity-0"
          >
            <div v-show="!isCameraOn" class="bg-gray-700/20 backdrop-blur-sm backdrop-filter absolute inset-0 flex items-center justify-center select-none">
              鏡頭尚未開啟
            </div>
          </transition>
          <canvas v-show="showCanvas" ref="canvasEl" width="640" height="360" class="absolute top-0 w-full" />
        </div>
        <!-- TODO: Handle user disconnection -->
        <!-- TODO: Handle remote hide camera -->
      </div>
      <div class="flex-1 flex p-4 justify-center items-center bg-gray-700/20 rounded-lg backdrop-blur-sm backdrop-filter">
        <div class="relative overflow-hidden rounded-lg w-full">
          <video
            ref="remoteVideoEl"
            playsinline autoplay :srcObject="remoteStream" class="aspect-video w-full"
          />
          <div v-if="!remoteStream" class="bg-gray-700/20 backdrop-blur-sm backdrop-filter absolute inset-0 flex items-center justify-center select-none aspect-video">
            對方尚未連接
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

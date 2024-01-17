<script setup lang="ts">
import '@unocss/reset/tailwind-compat.css'

const route = useRoute()
const peerStore = usePeerStore()
const { peer, isPeerReady, remoteStream, call } = storeToRefs(peerStore)

const { cameras, microphones, speakers, currentCamera, currentMicrophone, currentSpeaker, supportChangeAudioOutput } = useDevices()

const videoEl1 = ref<HTMLVideoElement>()
const canvasEl = ref<HTMLCanvasElement>()

const showCanvas = ref(false)

const isMuted = ref(false)
const { stream, enabled, restart, constraints } = useUserMedia({
  enabled: true,
  autoSwitch: false,
  constraints: {
    video: { aspectRatio: 16 / 9 },
    audio: {},
  },
})

if (isPeerReady.value) { // 創好房間，等待其他人加入
  peer.value!.on('call', (_call) => {
    call.value = _call
    call.value.answer(stream.value)
    call.value.on('stream', (_remoteStream) => {
      remoteStream.value = _remoteStream
    })
  })
} else { // 加入房間
  await peerStore.createPeer()
  const stop = watch(stream, (newStream) => {
    if (newStream) {
      peerStore.callAnotherPeer(route.params.roomId as string, newStream)
      stop()
    }
  }, { immediate: true })
}

watch(currentCamera, async (newDeviceId, oldDeviceId) => {
  if (!oldDeviceId || !newDeviceId)
    return
  constraints.value!.video = { deviceId: newDeviceId, width: 640, height: 360 }
  handleChangeDevice('video')
})

watch(currentMicrophone, async (newDeviceId, oldDeviceId) => {
  if (!oldDeviceId || !newDeviceId)
    return
  // let newStream = null
  // try {
  //   newStream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: newDeviceId } })
  //   peerStore.changeMediaStream(newStream, 'audio')
  // } catch (e) {
  //   console.error(e)
  // }
  constraints.value!.audio = { deviceId: newDeviceId }
  handleChangeDevice('audio')
})

// Handle audio output change
onMounted(() => {
  if (!supportChangeAudioOutput.value)
    return
  watch(currentSpeaker, (newDeviceId, oldDeviceId) => {
    if (!oldDeviceId || !newDeviceId)
      return
    (videoEl1.value as any).setSinkId(newDeviceId)
  })
})

function toggleMuteMyself() {
  isMuted.value = !isMuted.value
  if (stream.value)
    stream.value.getAudioTracks()[0].enabled = !isMuted.value
}

// Draw the last frame of the video stream into the canvas, preventing the video from disappearing when switching devices
// TODO: Handle toggle camera
function handleChangeDevice(type: 'video' | 'audio') {
  const ctx = canvasEl.value!.getContext('2d')!
  ctx.drawImage(videoEl1.value!, 0, 0, 640, 360)
  showCanvas.value = true
  const stop = watch(stream, (newStream) => {
    if (newStream) {
      peerStore.changeMediaStream(newStream, type)
      setTimeout(() => {
        showCanvas.value = false
        stop()
      }, 100)
    }
  })
  if (enabled.value) {
    setTimeout(() => {
      restart()
    }, 100)
  }
}
</script>

<template>
  <div class="h-dvh bg-gray-50 flex flex-col bg-pattern p-4 gap-4">
    <nav class="p-4 bg-gray-700/20 rounded-lg backdrop-blur-sm backdrop-filter">
      <a href="/" class="font-black text-4xl text-white">
        WebRTC Playground
      </a>
    </nav>
    <div class="flex gap-4 flex-1">
      <div class="flex-1 flex p-4 justify-center items-center bg-gray-700/20 rounded-lg backdrop-blur-sm backdrop-filter relative">
        <div class="flex gap-4 p-2 px-4 absolute bottom-4 left-1/2 -translate-x-1/2 z-1 rounded-lg bg-gray-700/20">
          <button
            class="p-4 text-white rounded-full transition"
            :class="!isMuted ? 'bg-black/20 hover:(bg-black/30)' : 'bg-red-400 hover:(bg-red-500)'"
            @click="toggleMuteMyself"
          >
            <div v-show="!isMuted" class="i-tabler-microphone w-8 h-8" />
            <div v-show="isMuted" class="i-tabler-microphone-off w-8 h-8" />
          </button>
          <button
            class="p-4 text-white rounded-full transition"
            :class="enabled ? 'bg-black/20 hover:(bg-black/30)' : 'bg-red-400 hover:(bg-red-500)'"
            @click="enabled = !enabled"
          >
            <div v-show="enabled" class="i-tabler-video w-8 h-8" />
            <div v-show="!enabled" class="i-tabler-video-off w-8 h-8" />
          </button>
          <SettingModal
            v-model:currentCamera="currentCamera"
            v-model:currentMicrophone="currentMicrophone"
            v-model:currentSpeaker="currentSpeaker"
            :cameras="cameras" :microphones="microphones" :speakers="speakers"
          />
        </div>
        <div class="relative overflow-hidden rounded-lg w-full">
          <video
            ref="videoEl1" muted playsinline
            autoplay :srcObject="stream" class="aspect-video w-full"
          />
          <div v-if="!enabled" class="bg-gray-700/20 backdrop-blur-sm backdrop-filter absolute inset-0 flex items-center justify-center select-none">
            鏡頭尚未開啟
          </div>
          <canvas v-show="showCanvas" ref="canvasEl" width="640" height="360" class="absolute top-0 w-full" />
        </div>
        <!-- TODO: Add share button -->
        <!-- TODO: Handle user disconnection -->
      </div>
      <div class="flex-1 flex p-4 justify-center items-center bg-gray-700/20 rounded-lg backdrop-blur-sm backdrop-filter">
        <div class="relative overflow-hidden rounded-lg w-full">
          <video
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

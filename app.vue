<script setup lang="ts">
import '@unocss/reset/tailwind-compat.css'

const currentCamera = ref<string>()
const currentMicrophone = ref<string>()
const currentSpeaker = ref<string>()

const videoEl1 = ref<HTMLVideoElement>()
const canvasEl = ref<HTMLCanvasElement>()

const supportChangeAudioOutput = ref(false)
onMounted(() => {
  if ('setSinkId' in AudioContext.prototype) {
    supportChangeAudioOutput.value = true
    watch(currentSpeaker, (newDeviceId, oldDeviceId) => {
      if (!oldDeviceId || !newDeviceId)
        return
      (videoEl1.value as any).setSinkId(newDeviceId)
    })
  }
})

const showCanvas = ref(false)

const { stream, enabled, restart, constraints } = useUserMedia({
  enabled: true,
  autoSwitch: false,
  constraints: {
    video: { width: 640, height: 360 },
    audio: {},
  },
})

const { videoInputs: cameras, audioInputs: microphones, audioOutputs: _speakers } = useDevicesList({
  requestPermissions: true,
  // Update the list when devices are connected/disconnected
  onUpdated() {
    if (!cameras.value.find(i => i.deviceId === currentCamera.value))
      currentCamera.value = cameras.value[0]?.deviceId
    if (!microphones.value.find(i => i.deviceId === currentMicrophone.value))
      currentMicrophone.value = microphones.value[0]?.deviceId
    if (!_speakers.value.find(i => i.deviceId === currentSpeaker.value))
      currentSpeaker.value = _speakers.value[0]?.deviceId
  },
})
const speakers = computed(() => {
  if (!supportChangeAudioOutput.value)
    return _speakers.value.slice(0, 1)
  return _speakers.value
})

watch(currentCamera, async (newDeviceId, oldDeviceId) => {
  if (!oldDeviceId || !newDeviceId)
    return
  constraints.value!.video = { deviceId: newDeviceId, width: 640, height: 360 }
  handleChangeDevice()
})

watch(currentMicrophone, (newDeviceId, oldDeviceId) => {
  if (!oldDeviceId || !newDeviceId)
    return
  constraints.value!.audio = { deviceId: newDeviceId }
  handleChangeDevice()
})

// Draw the last frame of the video stream into the canvas, preventing the video from disappearing when switching devices
function handleChangeDevice() {
  const ctx = canvasEl.value!.getContext('2d')!
  ctx.drawImage(videoEl1.value!, 0, 0, 640, 360)
  showCanvas.value = true
  const stop = watch(stream, (isStreamReady) => {
    if (isStreamReady) {
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
  <div class="h-dvh bg-gray-200 flex">
    <div class="flex flex-col gap-2 p-2">
      <!-- Use ClientOnly to prevent missmatch issue: https://github.com/tailwindlabs/headlessui/issues/2913 -->
      <ClientOnly>
        <DevicesSelect v-model="currentCamera" :options="cameras" />
        <DevicesSelect v-model="currentMicrophone" :options="microphones" />
        <DevicesSelect v-model="currentSpeaker" :options="speakers" />
      </ClientOnly>
    </div>
    <div class="p-2">
      <button class="rounded-lg bg-green-200 px-4 py-2" @click="enabled = !enabled">
        {{ enabled ? 'Stop' : 'Start' }}
      </button>

      <video
        ref="videoEl1" muted
        autoplay :srcObject="stream" class="w-[640px] h-[360px] absolute"
      />
      <canvas v-show="showCanvas" ref="canvasEl" width="640" height="360" class="absolute" />
      <!-- invisible select-none pointer-events-none absolute -->
    </div>
  </div>
</template>

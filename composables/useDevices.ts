export function useDevices() {
  const currentCamera = ref<string>()
  const currentMicrophone = ref<string>()
  const currentSpeaker = ref<string>()

  const supportChangeAudioOutput = ref(false)
  if ('setSinkId' in AudioContext.prototype)
    supportChangeAudioOutput.value = true

  const { videoInputs: cameras, audioInputs: microphones, audioOutputs: _speakers } = useDevicesList({
    requestPermissions: true,
    // Update the list when devices are connected/disconnected
    // FIXME: Index 0 is not always the default device, should change to default device after stream is created
    onUpdated() {
      if (!cameras.value.find(i => i.deviceId === currentCamera.value))
        currentCamera.value = cameras.value[0]?.deviceId
      if (!microphones.value.find(i => i.deviceId === currentMicrophone.value))
        currentMicrophone.value = microphones.value[0]?.deviceId
      if (!_speakers.value.find(i => i.deviceId === currentSpeaker.value))
        currentSpeaker.value = _speakers.value[0]?.deviceId
    },
  })

  function initCurrentDevices(stream: MediaStream) {
    currentCamera.value = stream.getVideoTracks()[0].getSettings().deviceId
    currentMicrophone.value = stream.getAudioTracks()[0].getSettings().deviceId
  }

  const speakers = computed(() => {
    if (!supportChangeAudioOutput.value)
      return _speakers.value.slice(0, 1)
    return _speakers.value
  })

  return {
    cameras,
    microphones,
    speakers,
    currentCamera,
    currentMicrophone,
    currentSpeaker,
    supportChangeAudioOutput,
    initCurrentDevices,
  }
}

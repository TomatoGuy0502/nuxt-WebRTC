import { Peer } from 'peerjs'
import type { MediaConnection } from 'peerjs'

export const usePeerStore = defineStore('peer', () => {
  const peerId = ref('')
  const isPeerReady = computed(() => peerId.value !== '')
  const peer = ref<Peer>()

  function createPeer() {
    return new Promise<void>((resolve) => {
      peer.value = new Peer({
        host: 'localhost',
        port: 3001,
        path: '/',
      })
      peer.value.on('open', (id) => {
        peerId.value = id
        resolve()
      })
      peer.value.on('error', (err) => {
        console.error(err)
      })
    })
  }

  const remoteStream = ref<MediaStream>()
  const call = ref<MediaConnection>()
  function callAnotherPeer(peerId: string, stream: MediaStream) {
    if (!peer.value || !isPeerReady.value)
      return
    call.value = peer.value.call(peerId, stream)
    call.value.on('stream', (_remoteStream) => {
      remoteStream.value = _remoteStream
    })
  }
  function changeMediaStream(stream: MediaStream, type: 'video' | 'audio' | 'both' = 'both') {
    call.value?.peerConnection?.getSenders().forEach((sender) => {
      if ((type === 'both' || type === 'video') && sender.track?.kind === 'video')
        sender.replaceTrack(stream.getVideoTracks()[0])

      else if ((type === 'both' || type === 'audio') && sender.track?.kind === 'audio')
        sender.replaceTrack(stream.getAudioTracks()[0])
    })
  }

  return {
    peerId,
    isPeerReady,
    peer,
    createPeer,
    remoteStream,
    callAnotherPeer,
    changeMediaStream,
    call,
  }
})

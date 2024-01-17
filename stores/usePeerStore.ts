import { Peer } from 'peerjs'
import type { MediaConnection } from 'peerjs'

export const usePeerStore = defineStore('peer', () => {
  const peerId = ref('')
  const isPeerReady = computed(() => peerId.value !== '')
  const peer = ref<Peer>()
  const isCheckingRoomExist = ref(false)
  const isRoomExist = ref(false)

  function createPeer() {
    if (peer.value)
      return
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
        switch (err.type) {
          case 'peer-unavailable':
            isCheckingRoomExist.value = false
            isRoomExist.value = false
            console.error(err)
            break
          default:
            isCheckingRoomExist.value = false
            isRoomExist.value = false
            console.error(err)
            break
        }
      })
    })
  }

  const remoteStream = ref<MediaStream>()
  const call = ref<MediaConnection>()
  function callAnotherPeer(peerId: string, stream: MediaStream) {
    if (!peer.value || !isPeerReady.value)
      return
    isCheckingRoomExist.value = true
    call.value = peer.value.call(peerId, stream)
    call.value.on('stream', (_remoteStream) => {
      isCheckingRoomExist.value = false
      isRoomExist.value = true
      remoteStream.value = _remoteStream
    })
  }
  function changeMediaStreamTrack(track: MediaStreamTrack, type: 'video' | 'audio') {
    call.value?.peerConnection?.getSenders().forEach((sender) => {
      if (type === sender.track?.kind) {
        sender.track.stop() // stop old track
        sender.replaceTrack(track)
      }
    })
  }

  return {
    peerId,
    isPeerReady,
    peer,
    createPeer,
    remoteStream,
    callAnotherPeer,
    changeMediaStreamTrack,
    call,
    isCheckingRoomExist,
    isRoomExist,
  }
})

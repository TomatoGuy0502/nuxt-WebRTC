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
  const mediaConnection = ref<MediaConnection>()
  function callAnotherPeer(peerId: string, stream: MediaStream) {
    if (!peer.value || !isPeerReady.value)
      return
    isCheckingRoomExist.value = true
    mediaConnection.value = peer.value.call(peerId, stream)
    mediaConnection.value.on('stream', (_remoteStream) => {
      isCheckingRoomExist.value = false
      isRoomExist.value = true
      remoteStream.value = _remoteStream
    })
    _listenRemoteDisconnect()
  }
  function changeMediaStreamTrack(track: MediaStreamTrack, type: 'video' | 'audio') {
    mediaConnection.value?.peerConnection?.getSenders().forEach((sender) => {
      if (type === sender.track?.kind) {
        sender.track.stop() // stop old track
        sender.replaceTrack(track)
      }
    })
  }

  async function checkRoomStatus(toRemoteStream: Ref<MediaStream | undefined>) {
    const roomId = useRoute().params.roomId as string
    isCheckingRoomExist.value = true

    if (isPeerReady.value) { // Already in room
      isCheckingRoomExist.value = false
      isRoomExist.value = true
      peer.value!.on('call', (_mediaConnection) => {
        mediaConnection.value = _mediaConnection
        mediaConnection.value.answer(toRemoteStream.value)
        mediaConnection.value.on('stream', (_remoteStream) => {
          remoteStream.value = _remoteStream
        })
        _listenRemoteDisconnect()
      })
    } else { // Enter room
      await createPeer()
      if (toRemoteStream.value) {
        callAnotherPeer(roomId, toRemoteStream.value)
      } else {
        // Wait for stream ready
        watch(toRemoteStream, (newStream) => {
          if (newStream)
            callAnotherPeer(roomId, newStream)
        }, { once: true })
      }
    }
  }

  function _listenRemoteDisconnect() {
    mediaConnection.value!.on('close', () => {
      remoteStream.value = undefined
      mediaConnection.value = undefined
    })
    // Workaround for opening 2 tabs in Chrome in same machine. Just for demo purpose.
    const timer = setInterval(() => {
      if (remoteStream.value && remoteStream.value.getVideoTracks()[0].muted) {
        remoteStream.value = undefined
        mediaConnection.value = undefined
        clearInterval(timer)
      }
    }, 1000)
  }

  return {
    peerId,
    isPeerReady,
    peer,
    createPeer,
    remoteStream,
    callAnotherPeer,
    changeMediaStreamTrack,
    mediaConnection,
    isCheckingRoomExist,
    isRoomExist,
    checkRoomStatus,
  }
})

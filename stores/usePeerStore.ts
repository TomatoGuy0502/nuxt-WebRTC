import { Peer } from 'peerjs'
import type { MediaConnection } from 'peerjs'

export const usePeerStore = defineStore('peer', () => {
  const peerId = ref('')
  const peer = ref<Peer>()
  const isCheckingRoomExist = ref(false)
  const isRoomExist = ref(false)

  const remoteStream = ref<MediaStream>()
  const mediaConnection = shallowRef<MediaConnection>()
  const bc = ref<BroadcastChannel>()

  function createPeer() {
    if (peer.value)
      return
    return new Promise<void>((resolve) => {
      peer.value = new Peer(generateID(10), {
        // host: 'localhost',
        // port: 3001,
        // path: '/',
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
      peer.value.on('call', (_mediaConnection) => {
        // If already in call, ignore
        if (mediaConnection.value)
          return
        mediaConnection.value = _mediaConnection
        mediaConnection.value.on('stream', (_remoteStream) => {
          remoteStream.value = _remoteStream
        })
        _listenRemoteDisconnect()
        bc.value!.postMessage({ from: peerId.value, to: _mediaConnection.peer })
      })
    })
  }

  async function checkRoomStatus(toRemoteStream: Ref<MediaStream | undefined>) {
    const roomId = useRoute().params.roomId as string
    isCheckingRoomExist.value = true

    // Workaround for opening 2 tabs in Chrome in same machine. Just for demo purpose.
    bc.value = new BroadcastChannel(roomId)
    bc.value.onmessage = _listenSameBrowserDisconnect

    if (roomId === peerId.value) { // Creater of the room
      isCheckingRoomExist.value = false
      isRoomExist.value = true

      watch([toRemoteStream, mediaConnection], ([newStream, newMediaConnection]) => {
        if (newStream && newMediaConnection)
          newMediaConnection.answer(newStream)
      })
    } else { // Participant of the room
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

  function callAnotherPeer(remotePeerId: string, stream: MediaStream) {
    if (!peer.value)
      return
    isCheckingRoomExist.value = true
    mediaConnection.value = peer.value.call(remotePeerId, stream)
    mediaConnection.value.on('stream', (_remoteStream) => {
      if (remoteStream.value)
        return
      isCheckingRoomExist.value = false
      isRoomExist.value = true
      remoteStream.value = _remoteStream
      // Try to send message to another tab
      bc.value!.postMessage({ from: peerId.value, to: remotePeerId })
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

  function hangup() {
    mediaConnection.value?.close()
    remoteStream.value = undefined
    mediaConnection.value = undefined
  }

  function _listenRemoteDisconnect() {
    mediaConnection.value!.on('close', () => {
      remoteStream.value = undefined
      mediaConnection.value = undefined
    })
  }

  // Workaround for opening 2 tabs in Chrome in same machine. Just for demo purpose.
  function _listenSameBrowserDisconnect(_e: MessageEvent<{ from: string, to: string }>) {
    const timer = window.setInterval(() => {
      if (remoteStream.value && remoteStream.value.getVideoTracks()[0].muted) {
        mediaConnection.value?.close()
        remoteStream.value = undefined
        mediaConnection.value = undefined
        clearInterval(timer)
      }
    }, 3000)
  }

  return {
    peerId,
    peer,
    createPeer,
    remoteStream,
    callAnotherPeer,
    changeMediaStreamTrack,
    mediaConnection,
    isCheckingRoomExist,
    isRoomExist,
    checkRoomStatus,
    hangup,
  }
})

<script setup lang="ts">
const peerStore = usePeerStore()
const router = useRouter()

const roomId = ref('')

async function handleCreateRoom() {
  await peerStore.createPeer()
  router.push(`/room/${peerStore.peerId}`)
}

function handleJoinRoom() {
  if (!roomId.value)
    return
  router.push(`/room/${roomId.value}`)
}
</script>

<template>
  <div class="h-dvh flex flex-col items-center justify-center bg-gray-50 bg-pattern p-4">
    <div class="flex flex-col items-center justify-center gap-4 p-10 shadow-lg bg-gray-700/20 rounded-lg backdrop-blur-sm backdrop-filter">
      <h1 class="font-black text-5xl mb-8 drop-shadow-lg text-white text-center">
        WebRTC Playground
      </h1>
      <div class="flex flex-col gap-4">
        <button class="flex items-center justify-center gap-2 px-4 py-2 bg-orange-300 rounded-lg font-bold text-white transition hover:(bg-orange-400)" @click="handleCreateRoom">
          <div class="i-tabler-video-plus w-5 h-5 mt-0.5" />
          <span>Create New Room</span>
        </button>
        <div class="relative flex h-6 items-center gap-2">
          <hr class="w-full"><span class="text-white text-xl font-bold pb-1">or</span><hr class="w-full">
        </div>
        <div class="flex">
          <input v-model.trim="roomId" type="text" placeholder="Enter Room ID" class="px-4 py-2 rounded-l-lg outline-none ">
          <button class="flex items-center gap-2 px-4 py-2 bg-orange-300 transition hover:(bg-orange-400) rounded-r-lg font-bold text-white cursor-pointer" @click="handleJoinRoom">
            <div class="i-tabler-door-enter h-5 w-5 mt-0.5" />
            <span>Join</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

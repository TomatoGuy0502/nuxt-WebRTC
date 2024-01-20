<script lang="ts" setup>
const props = defineProps<{
  copyText: string
  showText: string
}>()
const timeoutId = ref<number>()
const showCopied = ref(false)

function handleCopy() {
  window.clearTimeout(timeoutId.value)
  navigator.clipboard.writeText(props.copyText)
  showCopied.value = true
  timeoutId.value = window.setTimeout(() => {
    showCopied.value = false
  }, 1000)
}
</script>

<template>
  <button
    class="flex items-center gap-2 p-2 px-4 rounded-lg bg-orange-300 transition text-white hover:(bg-orange-400)"
    @click="handleCopy"
  >
    <Transition name="fade" mode="out-in">
      <div v-if="showCopied" class="i-tabler-copy-check w-5 h-5 mt-0.5" />
      <div v-else class="i-tabler-copy w-5 h-5 mt-0.5" />
    </Transition>
    <span class="font-bold">{{ showText }}</span>
  </button>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

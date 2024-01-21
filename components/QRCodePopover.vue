<script lang="ts" setup>
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import QRCode from 'qrcode'

const canvasEl = ref<HTMLCanvasElement>()

onMounted(async () => {
  await QRCode.toCanvas(canvasEl.value, window.location.href, {
    width: 240,
    margin: 1,
  })
})
</script>

<template>
  <Popover v-slot="{ open }" class="relative">
    <PopoverButton
      class="flex items-center gap-2 p-2 sm:px-4 rounded-lg bg-orange-300 transition text-white hover:(bg-orange-400) outline-none"
    >
      <div class="i-tabler-qrcode w-6 h-6 sm:mt-0.5" />
      <span class="hidden sm:inline">QRCode</span>
    </PopoverButton>

    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-1 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-1 opacity-0"
    >
      <div v-show="open">
        <PopoverPanel
          static
          class="absolute left-1/2 -translate-x-1/2 mt-2 bg-white p-4 rounded-lg"
        >
          <canvas ref="canvasEl" class="w-60 h-60" />
        </PopoverPanel>
      </div>
    </transition>
  </Popover>
</template>

<style>

</style>

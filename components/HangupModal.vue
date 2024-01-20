<script setup lang="ts">
import {
  Dialog,
  DialogDescription,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'

const emit = defineEmits<{
  'confirm': []
  'cancel': []
}>()

const isOpen = ref(false)

function handleConfirm() {
  emit('confirm')
  isOpen.value = false
}
function handleCancel() {
  emit('cancel')
  isOpen.value = false
}
</script>

<template>
  <button
    class="p-3 lg:p-4 text-white rounded-full transition bg-red-400 hover:(bg-red-500)"
    @click="isOpen = true"
  >
    <div class="i-tabler-phone-off w-6 h-6 lg:(w-8 h-8)" />
  </button>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" :open="isOpen" @close="handleCancel">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/25 z-1" />
      </TransitionChild>
      <div class="fixed inset-0 flex w-screen items-center justify-center p-4 z-1">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0 scale-95"
          enter-to="opacity-100 scale-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100 scale-100"
          leave-to="opacity-0 scale-95"
        >
          <DialogPanel class="relative flex flex-col gap-4 bg-white p-4 rounded-lg w-80">
            <DialogTitle class="font-bold text-2xl">
              結束通話
            </DialogTitle>
            <DialogDescription class="mb-4">
              即將結束通話，確定嗎？
            </DialogDescription>
            <div class="flex">
              <button class="bg-gray-200 px-4 py-2 rounded-lg ml-auto transition hover:bg-gray-300" @click="handleCancel">
                繼續通話
              </button>
              <button class="bg-red-400 px-4 py-2 rounded-lg ml-2 transition hover:bg-red-500 text-white" @click="handleConfirm">
                結束通話
              </button>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

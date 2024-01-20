<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'

const props = defineProps<{
  cameras: MediaDeviceInfo[]
  microphones: MediaDeviceInfo[]
  speakers: MediaDeviceInfo[]
}>()

const { cameras, microphones, speakers } = toRefs(props)

const isOpen = ref(false)

function setIsOpen(value: boolean) {
  isOpen.value = value
}
const currentCamera = defineModel<string>('currentCamera')
const currentMicrophone = defineModel<string>('currentMicrophone')
const currentSpeaker = defineModel<string>('currentSpeaker')
</script>

<template>
  <button
    type="button"
    class="rounded-full z-1 bg-black/20 p-2 lg:p-3 text-white shadow transition hover:bg-black/30 outline-none"
    @click="setIsOpen(true)"
  >
    <div class="i-tabler-settings w-8 h-8 lg:(h-10 w-10)" />
  </button>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" :open="isOpen" @close="setIsOpen">
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
          <DialogPanel class="relative flex flex-col gap-8 bg-white p-6 rounded-lg">
            <div class="flex justify-between gap-20">
              <DialogTitle class="font-bold text-2xl">
                設定 Setting
              </DialogTitle>
              <div class="p-1 cursor-pointer" @click="isOpen = false">
                <div class="i-tabler-x w-6 h-6" />
              </div>
            </div>
            <div class="flex flex-col gap-4">
              <div>
                <div class="flex items-center gap-2 mb-2 text-gray-800">
                  <div class="i-tabler-camera w-5 h-5" />
                  <p class="font-bold text-lg leading-none">
                    攝影機 Camera
                  </p>
                </div>
                <SettingModalDevicesSelect v-model="currentCamera" :options="cameras" />
              </div>
              <div>
                <div class="flex items-center gap-2 mb-2 text-gray-800">
                  <div class="i-tabler-microphone w-5 h-5" />
                  <p class="font-bold text-lg leading-none">
                    麥克風 Microphone
                  </p>
                </div>
                <SettingModalDevicesSelect v-model="currentMicrophone" :options="microphones" />
              </div>
              <div>
                <div class="flex items-center gap-2 mb-2 text-gray-800">
                  <div class="i-tabler-device-speaker w-5 h-5" />
                  <p class="font-bold text-lg leading-none">
                    揚聲器 Speaker
                  </p>
                </div>
                <SettingModalDevicesSelect v-model="currentSpeaker" :options="speakers" />
              </div>
            </div>
            <div class="flex">
              <button class="bg-green-200 px-4 py-2 rounded-lg font-bold ml-auto hover:bg-green-300" @click="setIsOpen(false)">
                完成
              </button>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

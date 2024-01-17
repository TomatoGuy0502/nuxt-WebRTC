<script lang="ts" setup>
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/vue'

const props = defineProps<{
  options: MediaDeviceInfo[]
}>()

const selectedOption = defineModel<string>()
const selectedOptionLabel = computed(() => {
  const option = props.options.find(i => i.deviceId === selectedOption.value)
  return option?.label
})
</script>

<template>
  <Listbox v-slot="{ open }" v-model="selectedOption">
    <div v-if="open" class="fixed inset-0" />
    <div class="relative w-80 max-w-80">
      <ListboxButton
        class="flex items-center justify-between gap-2 w-full h-10 rounded-lg bg-gray-100 py-2 px-3 text-left focus:outline-none"
      >
        <span class="block truncate text-nowrap">
          {{ selectedOptionLabel }}
        </span>
        <div class="i-tabler-arrows-move-vertical w-4 h-4 shrink-0" />
      </ListboxButton>
      <transition
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <ListboxOptions class="absolute z-1 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none">
          <ListboxOption
            v-for="(option, i) in props.options"
            v-slot="{ active, selected }"
            :key="option.deviceId"
            :value="option.deviceId"
            as="template"
          >
            <li
              class="relative flex cursor-default select-none py-2 pl-10 pr-4"
              :class="[
                active ? 'bg-gray-100 text-gray-900' : 'text-gray-900',
              ]"
            >
              <div v-if="selected" class="i-tabler-check w-5 h-5 absolute left-0 ml-3" />
              <span class="block truncate">{{ `${i + 1} - ${option.label}` }}</span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>
</template>

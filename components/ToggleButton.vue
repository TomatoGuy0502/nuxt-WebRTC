<script lang="ts" setup>
defineProps<{
  isOn: boolean
  isOnIcon: string
  isOffIcon: string
}>()

const emit = defineEmits<{
  toggle: []
}>()
</script>

<template>
  <button
    class="p-3 lg:p-4 text-white rounded-full transition"
    :class="isOn ? 'bg-black/20 hover:(bg-black/30)' : 'bg-red-400 hover:(bg-red-500)'"
    @click="emit('toggle')"
  >
    <div v-show="isOn" class="w-6 h-6 lg:(w-8 h-8)" :class="isOnIcon" />
    <div v-show="!isOn" class="w-6 h-6 lg:(w-8 h-8)" :class="isOffIcon" />
  </button>
</template>

<style>

</style>

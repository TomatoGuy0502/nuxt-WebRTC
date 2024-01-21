<script setup lang="ts">
import '@unocss/reset/tailwind-compat.css'

useHead({
  title: 'WebRTC Playground',
  meta: [
    {
      name: 'description',
      content: 'WebRTC Playground',
    },
  ],
  link: [
    {
      rel: 'icon',
      href: '/favicon.svg',
    },
  ],
})
</script>

<template>
  <div class="h-dvh font-sans">
    <NuxtPage />
  </div>
</template>

<style>
.bg-pattern {
  background-image: url("/assets/bg-pattern.svg");
  background-size: 300px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

<template>
  <UApp :toaster="toaster">
    <slot />
  </UApp>
</template>

<script setup>
  const toaster = {
    position: 'top-right',
    duration: 3000,
    ui: {
      viewport: 'fixed flex flex-col w-[calc(100%-2rem)] sm:w-96 z-[100] focus:outline-none mt-10'
    }
  }
</script>
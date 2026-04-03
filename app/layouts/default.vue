<template>
  <UApp :toaster="toaster">
    <slot />
  </UApp>
</template>

<script setup>
  const toaster = {
    position: 'top-right',
    duration: 3000
  }
</script>
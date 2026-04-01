<template>
  <IonApp>
    <NuxtLayout :name="layoutName">
      <IonRouterOutlet />
    </NuxtLayout>
  </IonApp>
</template>

<script setup>
  const route = useRoute()
  const layoutName = computed(() => route.meta.layout || 'default')
</script>

<template>
  <IonApp >
    <NuxtLayout>
      <IonRouterOutlet />
    </NuxtLayout>
  </IonApp>
</template>

<script setup>
  import { StatusBar, Style } from '@capacitor/status-bar';

  onMounted(async() => {
    await StatusBar.setStyle({ style: Style.Light });
  })  
</script>

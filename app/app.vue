<template>
  <ion-app>
    <NuxtLayout>
      <ion-router-outlet />
    </NuxtLayout>
  </ion-app>
</template>

<script setup>
  import { StatusBar, Style } from '@capacitor/status-bar';
  import { App } from '@capacitor/app';
  
  const user = useSupabaseUser()

  let route = useRoute()

  onMounted(async() => {
    try {
      await StatusBar.setStyle({ style: Style.Light });      
    } catch (error) {
      console.log('status bar not available for web')
    }
    console.log('user??', user)
  })
  
  App.addListener('backButton', () => {
    let path = route.path
    let path2 = window.location.pathname

    //let rootPages = ['/login','/admin/']

    console.log('index path',path)
    console.log('index2 path', path2)
  })
</script>

<template>
  <IonPage>
    <IonContent>
        <div class="min-h-full bg-gray-100 pt-24 px-6">
          <div class="flex flex-col gap-4">
            <UCard variant="outline" class="shadow px-2 py-2">
              <div class="flex justify-between">
                <p class="text-sm font-medium">Total Borrowed Itemss</p>
                <UIcon name="i-lucide-box" class="text-blue-500" />
              </div>
              <p class="text-2xl font-bold mt-4 text-gray-800">43</p>
            </UCard>
            <UCard variant="outline" class="shadow px-2 py-2">
              <div class="flex justify-between">
                <p class="text-sm font-medium">Pending Requests</p>
                <UIcon name="i-lucide-workflow" class="text-blue-500" />
              </div>
              <p class="text-2xl font-bold mt-4 text-gray-800">43</p>
            </UCard>
            <UCard variant="outline" class="shadow px-2 py-2">
              <div class="flex justify-between">
                <p class="text-sm font-medium">Overdue Items</p>
                <UIcon name="i-lucide-clock" class="text-blue-500" />
              </div>
              <p class="text-2xl font-bold mt-4 text-gray-800">43</p>
            </UCard>
            <UCard variant="outline" class="shadow px-2 py-2">
              <div class="flex justify-between">
                <p class="text-sm font-medium">Returned Items</p>
                <UIcon name="i-lucide-archive" class="text-blue-500" />
              </div>
              <p class="text-2xl font-bold mt-4 text-gray-800">43</p>
            </UCard>
          </div>
        
        </div>
    </IonContent>
  </IonPage>
</template>

<script setup>
  import { App } from '@capacitor/app';

  definePageMeta({
    layout: 'admin'
  })

  // const route = useRoute() 
  // const isExitApp = ref(false)

  // const exitApp = () => App.exitApp()

  // onMounted(() => {
  //   App.addListener('backButton', (data) => {
  //     if(route.path == '/user/dashboard') {
  //       isExitApp.value = true
  //     }
  //   })
  // })
</script>
<template>
  <IonPage>
    <IonContent>
  <div class="bg-white min-h-screen">
    <div class="flex items-center justify-center h-screen px-4 gap-x-1 text-center -mt-30">
      <img src="/img/aclclogo.jpeg" class="h-25 w-25" />
      <p class="text-3xl font-bold text-gray-800">ACLC Technical Borrowing System</p>
    </div>
    <div class="flex items-center justify-center -mt-50">
      <p class="text-gray-800">Loading app ...</p>
    </div>
  </div>
  </IonContent>
  </IonPage>
</template>

<script setup>
 import { Network } from '@capacitor/network'
  
  //const { isConnected } = useNetwork()
  const ionRouter = useIonRouter()
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()
  const userStore = useUserStore()
  const toast = useToast()
  
  const navigate = () => {
    if (ionRouter.canGoBack() !== undefined) { 
      ionRouter.replace('/login')
    } else {
      setTimeout(navigate, 100)
    }
  }
  
  onMounted( async () => {
    console.log('index',user.value)
    
  })

</script>
<template>
  <UApp :toaster="toaster">
    <div class="fixed top-0 left-0 w-full py-[12px] px-4 shadow-sm bg-white flex items-center justify-between z-50">
      <div class="flex items-center">
        <UDrawer direction="left" v-model:open=open>
         <UButton icon="i-lucide-menu" size="xl" variant="ghost" color="neutral" />
          <template #content>
            <div class="min-w-60 px-4 py-6">
              <div class="flex gap-x-4">
                <img src="https://cdn.dribbble.com/users/6713991/avatars/normal/441fa8355b0bc25577653d93f0c7d6cc.png?1697551111" class="h-12 rounded-full"/>
                <p class="text-gray-800 font-bold">{{ userStore.user.firstname }}, <span class="block text-xs text-gray-400">{{ userStore.user.user_type }}</span></p>
              </div>
              <div class="border border-gray-100 mt-4"></div>
              <div class="text-gray-800 mt-8 flex flex-col gap-2">
                <UButton icon="i-lucide-layout-dashboard" size="lg" color="neutral" variant="ghost" class="w-full" @click="toLink('dashboard')">Dashboard</UButton>
                <UButton icon="i-lucide-box" size="lg" color="neutral" variant="ghost" class="w-full" @click="toLink('available-items')">Available Items</UButton>
                <UButton icon="i-lucide-list-restart" size="lg" color="neutral" variant="ghost" class="w-full" @click="toLink('request-monitoring')">Request Monitoring</UButton>
                <UButton icon="i-lucide-bell" size="lg" color="neutral" variant="ghost" class="w-full" @click="toLink('notifications')">Notifications</UButton>
              </div>
            </div>
          </template>
        </UDrawer>
        <img src="~/assets/img/aclclogo.jpeg" class="h-9 inline ml-2"/>
      </div>
      <div>
        <span class="mr-2">{{ userStore.user.firstname }}</span>
        <UDropdownMenu :items="profileItems">
          <UAvatar src="https://cdn.dribbble.com/users/6713991/avatars/normal/441fa8355b0bc25577653d93f0c7d6cc.png?1697551111" size="lg" />
        </UDropdownMenu>
      </div>
    </div>
   <UModal :close="false" :dismissible="false" v-model:open="isLogoutOpen">
      <template #body>
        <div class="text-gray-700 flex justify-center items-center h-16">
          <p class="font-medium">Logging out ...</p>
        </div>
      </template>
    </UModal>
    <div class="bg-gray-100 min-h-screen">
      <div class="px-6 pb-10">
        <br><br><br><br>
        <slot />
      </div>
    </div>
    <UModal title="Exit App?" v-model:open="isExitApp" :ui="{ footer: 'justify-end' }">
      <template #body>
        <div class="text-gray-700">
          Are you sure you want to close the app?
        </div>
      </template>
      <template #footer="{ close }">
        <UButton color="error" variant="soft" @click="close">Cancel</UButton>
        <UButton color="secondary" @click="exitApp">Exit App</UButton>
      </template>
    </UModal>
  </UApp>
</template>

<script setup>
  import { useBackButton, useIonRouter } from '@ionic/vue';
  import { App } from '@capacitor/app';
  
  const supabase = useSupabaseClient()
  const ionRouter = useIonRouter()
  const userStore = useUserStore()
  const toast = useToast()
  const open = ref(false)
  const isLogoutOpen = ref(false)
  const route = useRoute()
  const isExitApp = ref(false)
  
  const profileItems = ref([
    {
      label: 'Profile',
      icon: 'i-lucide-user',
      onSelect() {
        toProfile()
      }
    },
    {
      label: 'Logout',
      icon: 'i-lucide-log-out',
      onSelect() {
        handleLogout()
      }
    }
  ])
  const toaster = {
    position: 'top-right',
    duration: 3000
  }
  
  
  defineShortcuts({
  o: () => (open.value = !open.value)
})
  
  useBackButton(10, (processNextHandler) => {
    if (open.value) {
      open.value = false;
    } else {
      processNextHandler();
    }
  });

// Handle Browser (For testing in Chrome)
watch(open, (isNowOpen) => {
  if (isNowOpen) {
    // Add a fake entry to history so 'back' closes the drawer instead of leaving
    history.pushState({ drawer: 'open' }, '');
  }h
});

  const toLink = async (label) => {
    await ionRouter.navigate(`/user/${label}`, 'forward', 'push')
    open.value = false
  }

  const toProfile = () => {
    ionRouter.navigate('/profile', 'forward', 'push')
  }


  const handleLogout = async () => {
    isLogoutOpen.value = true
    let { error } = await supabase.auth.signOut()
    if(error) {
      toast.add({
        title: 'Application Error',
        description: 'An error occured while processing data',
        icon: 'i-lucide-circle-x',
        color: 'error'
      })
      console.log(error)
      return
    }
    isLogoutOpen.value = false
    userStore.$reset
    ionRouter.navigate('/login', 'replace', 'root')
    setTimeout(() => {
      toast.add({
        title: 'Logout Successfully!',
        description: 'You have been signed out successfully',
        icon: 'i-lucide-message-circle-check',
        color: 'secondary'
      
      })
    },500)
  }

  const exitApp = () => App.exitApp()
  
  onMounted(() => {
    App.addListener('backButton', (data) => {
      if(route.path.includes('/user') && open == false) {
        isExitApp.value = true
      }
    })
  })
</script>
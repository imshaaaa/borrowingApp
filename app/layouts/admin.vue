<template>
  <UApp :toaster="toaster">
    <div class="fixed top-0 left-0 w-full py-[12px] px-4 shadow-sm bg-white flex items-center justify-between z-50">
      <div class="flex items-center">
        <UDrawer direction="left" v-model:open=open>
         <UButton icon="i-lucide-menu" size="xl" variant="ghost" color="neutral"/>
          <template #content>
            <div class="min-w-60 px-4 py-6">
              <div class="flex gap-x-4">
                <img src="https://cdn.dribbble.com/users/6713991/avatars/normal/441fa8355b0bc25577653d93f0c7d6cc.png?1697551111" class="h-12 rounded-full"/>
                <p class="text-gray-800 font-bold">{{ userStore.user.firstname }}, <span class="block text-xs text-gray-400">{{ userStore.user.user_type }}</span></p>
              </div>
              <div class="border border-gray-100 mt-4"></div>
              <div class="text-gray-800 mt-8 flex flex-col gap-2">
                <UButton icon="i-lucide-layout-dashboard" size="lg" color="neutral" variant="ghost" class="w-full" @click="toLink('dashboard')">Dashboard</UButton>
                <UButton icon="i-lucide-box" size="lg" color="neutral" variant="ghost" class="w-full" @click="toLink('manage-stocks')">Manage Stocks</UButton>
                <UButton icon="i-lucide-workflow" size="lg" color="neutral" variant="ghost" class="w-full" @click="toLink('borrowed-items')">Borrowed Items</UButton>
                <UButton icon="i-lucide-users" size="lg" color="neutral" variant="ghost" class="w-full" @click="toLink('manage-users')">Manage Users</UButton>
                <UButton icon="i-lucide-file-chart-column" size="lg" color="neutral" variant="ghost" class="w-full" @click="toLink('reports')">Reports</UButton>
                <UButton icon="i-lucide-history" size="lg" color="neutral" variant="ghost" class="w-full" @click="toLink('history')">History</UButton>
              </div>
            </div>
          </template>
        </UDrawer>
        <img src="~/assets/img/aclclogo.jpeg" class="h-9 inline ml-2"/>
      </div>
      <div class="flex justify-center items-center gap-2">
        <p>{{ userStore.user.firstname }}</p>
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
    <div class="bg-gray-100 h-full">
      <div class="px-6">
        <br><br><br><br>
        <slot />
      </div>
    </div>
  </UApp>
</template>

<script setup>
  import { useBackButton, useIonRouter } from '@ionic/vue';
  import { App } from '@capacitor/app';
  import { Capacitor } from '@capacitor/core'
  import { Network } from '@capacitor/network'
  //import { ForegroundService } from '@capawesome-team/capacitor-android-foreground-service';
  import { LocalNotifications } from '@capacitor/local-notifications'

  const supabase = useSupabaseClient()
  const ionRouter = useIonRouter()
  const userStore = useUserStore()
  const toast = useToast()
  const open = ref(false)
  const isLogoutOpen = ref(false)
  const profileItems = ref([
    {
      label: 'Profile',
      icon: 'i-lucide-user'
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
  let adminChannel = null
  const isNative = Capacitor.isNativePlatform()
  const isOnline = ref(true)
  
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
    await ionRouter.navigate(`/admin/${label}`, 'forward', 'push')
    open.value = false
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
    userStore.$reset
    ionRouter.replace('/login')
    setTimeout(() => {
      toast.add({
        title: 'Logout Successfully!',
        description: 'You have been signed out successfully',
        icon: 'i-lucide-message-circle-check',
        color: 'secondary'
      
      })
    },500)
  }

  // const startAdminListener = async () => {

  //   if(adminChannel) await supabase.removeChannel()
    
  //   adminChannel = await supabase
  //     .channel('admin-notification-channel')
  //     .on(
  //       'postgres_changes', 
  //       {
  //         event: 'INSERT',
  //         schema: 'public',
  //         table: 'tbl_borrowed_item'
  //       }, (payload) => {
  //         toast.add({
  //           title: 'Borrow Request',
  //           description: `${payload.new.borrower_name} wants to borrow ${payload.new.quantity} pc(s) of ${payload.new.item}`,
  //           icon: 'i-lucide-circle-check',
  //           color: 'secondary',
  //         })
  //         triggerNotif(payload)
  //         console.log('notif', payload)
  //       }
  //     )
  //     .subscribe((status) => {
  //       if(status === 'SUBSCRIBED') {
  //         console.log('realtime connected')
  //       }
  //       if(status === 'CLOSED') {
  //         console.log('realtime connection error')
  //       }
  //     })
  // }

  // const setupNotification = async () => {
  //   if(!isNative) return

  //   let permission = await LocalNotifications.checkPermissions()
  //   if(permission.display !== 'granted') {
  //     await LocalNotifications.requestPermissions()
  //   }

  //   if(permission.display === 'granted') {
  //     await LocalNotifications.createChannel({
  //       id: 'borrow-alert',
  //       name: 'Technical App',
  //       description: 'Setting up for notification',
  //       importance: 5,
  //       visibility: 1,
  //       vibrate: true
  //     })
  //   }
  // }

  // const triggerNotif = async (data) => {
  //   if(!isNative) {
  //     console.log('Web Notif:', data)
  //     return
  //   }

  //   await LocalNotifications.schedule({
  //     notifications: [{
  //       id: Date.now(),
  //       title: 'Technical App',
  //       body: 'New borrow request!',
  //       channelId: 'borrow-alert',
  //       schedule: { 
  //       at: new Date(Date.now() + 100),
  //       allowWhileIdle: true
  //     },
  //     extra: { url: '/admin/borrowed-items' }
  //     }]
  //   })
  // }

  // const startForeground = async (start = true) => {
  //   if(!isNative || Capacitor.getPlatform() !== 'android') return

  //   try {
  //     if(start) {
  //       await ForegroundService.startForegroundService({
  //         id: 999,
  //         title: 'Technical Monitoring Service',
  //         body: 'Listening for realtime request...',
  //         smallIcon: 'ic_launcher',
  //         silent: false,
  //         notificationChannelId: 'borrow-alert',
  //       });
  //     } else {
  //       await ForegroundService.stopForegroundService();
  //     }
  //   } catch(err) {
  //     console.log(e)
  //   }
  // }

  //onMounted(async () => {
    // let status = await Network.getStatus()
    // isOnline.value = status.connected

    // if(isOnline.value) {
    //   await setupNotification()
    //   startAdminListener()
    //   startForeground(true)
    // }

    // Network.addListener('networkStatusChange', (s) => {
    //   isOnline.value = s.connected
    //   if (s.connected) {
    //     startAdminListener()
    //   }
    // })

    // if (isNative) {
    //   LocalNotifications.addListener('localNotificationActionPerformed', (notif) => {
    //     const url = notif.notification.extra?.url
    //     if (url) navigateTo(url)
    //   })
    // }
  //})

  //onUnmounted(() => {
    // startForeground(false)
    // if(adminChannel) {
    //   supabase.removeChannel(adminChannel)
    // }
  //})
  
</script>
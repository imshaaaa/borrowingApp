<template>
  <UApp :toaster="toaster">
    <div class="pt-[env(safe-area-inset-top)] fixed top-0 left-0 w-full py-[12px] px-4 shadow-sm bg-white flex items-center justify-between z-50">
      <div class="flex items-center">
        <UDrawer direction="left" v-model:open=open>
         <UButton icon="i-lucide-menu" size="xl" variant="ghost" color="neutral"/>
          <template #content>
            <div class="min-w-60 px-4 py-6 pt-[env(safe-area-inset-top)]">
              <div class="flex gap-x-4">
                <UAvatar :alt="userStore.user.fullname" size="xl"/>
                <p class="text-gray-800 font-bold">{{ userStore.user.firstname }} {{ userStore.user.middlename }} {{ userStore.user.lastname }} <span class="block text-xs text-gray-400">{{ userStore.user.user_type }}</span></p>
              </div>
              <div class="border border-gray-100 mt-4"></div>
              <div class="text-gray-800 mt-8 flex flex-col gap-2">
                <UButton icon="i-lucide-layout-dashboard" size="lg" color="neutral" :variant="activePath === '/admin/dashboard' ? 'solid' : 'ghost'" class="w-full" @click="toLink('dashboard')">Dashboard</UButton>
                <UButton icon="i-lucide-box" size="lg" color="neutral" :variant="activePath === '/admin/manage-stocks' ? 'solid' : 'ghost'" class="w-full" @click="toLink('manage-stocks')">Manage Equipments</UButton>
                <UButton icon="i-lucide-workflow" size="lg" color="neutral" :variant="activePath === '/admin/borrowed-items' ? 'solid' : 'ghost'" class="w-full" @click="toLink('borrowed-items')">Borrowed Equipments</UButton>
                <UButton icon="i-lucide-users" size="lg" color="neutral" :variant="activePath === '/admin/manage-users' ? 'solid' : 'ghost'" class="w-full" @click="toLink('manage-users')">Manage Users</UButton>
                <!--<UButton icon="i-lucide-file-chart-column" size="lg" color="neutral" variant="ghost" class="w-full" @click="toLink('reports')">Reports</UButton>-->
                <UButton icon="i-lucide-history" size="lg" color="neutral" :variant="activePath === '/admin/history' ? 'solid' : 'ghost'" class="w-full" @click="toLink('history')">History</UButton>
              </div>
            </div>
          </template>
        </UDrawer>
        <img src="~/assets/img/aclclogo.jpeg" class="h-9 inline ml-2"/>
      </div>
      <div class="flex justify-center items-center gap-2">
        <UDropdownMenu :items="profileItems">
          <UAvatar :alt="userStore.user.fullname" size="xl" />
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
    <UModal title="Exit App?" v-model:open="isExitApp" :ui="{ footer: 'justify-end' }">
      <template #body>
            <div class="text-gray-700 text-center">
              Are you sure you want to close the app?
            </div>
          </template>
          <template #footer="{ close }">
            <UButton color="error" variant="soft" @click="close">Cancel</UButton>
            <UButton color="secondary" @click="exitApp">Exit App</UButton>
          </template>
        </UModal>
    <div>
      <slot />
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
  //import { ref } from 'yup';

  const supabase = useSupabaseClient()
  const ionRouter = useIonRouter()
  const router = useRouter()
  const route = useRoute()
  const userStore = useUserStore()
  const toast = useToast()
  const open = ref(false)
  const isLogoutOpen = ref(false)
  const isExitApp = ref(false)
  const activePath = useState('activePath', () => route.path)
  let adminChannel = null
  const isNative = Capacitor.isNativePlatform()
  const isOnline = ref(true)

  const exitApp = () => App.exitApp()

  const profileItems = ref([
    {
      label: 'Profile',
      icon: 'i-lucide-user',
      class: activePath === '/admin/profile' ? 'bg-gray-700' : '',
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
  
  useBackButton(10, (processNextHandler) => {
    if (open.value) {
      open.value = false;
    } else {
      processNextHandler();
    }
  });

watch(open, (isNowOpen) => {
  if (isNowOpen) {
    history.pushState({ drawer: 'open' }, '');
  }h
});

  const toLink = async (label) => {
    await ionRouter.navigate(`/admin/${label}`, 'forward', 'push')
    open.value = false
  }

  const toProfile = () => {
    ionRouter.navigate('/admin/profile', 'forward', 'push')
  }

  const handleLogout = async () => {
    isLogoutOpen.value = true

    if(adminChannel) {
      supabase.removeChannel(adminChannel)
    }

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
    await nextTick()
    router.replace('/login')
    setTimeout(() => {
      toast.add({
        title: 'Logout Successfully!',
        description: 'You have been signed out successfully',
        icon: 'i-lucide-message-circle-check',
        color: 'secondary'
      
      })
    },500)
  }

  const startAdminListener = async () => {

    if(adminChannel) await supabase.removeChannel()
    
    adminChannel = await supabase
      .channel('admin-notification-channel')
      .on(
        'postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tbl_borrowed_item'
        }, (payload) => {
          toast.add({
            title: 'Borrow Request',
            description: `${payload.new.borrower_name} wants to borrow ${payload.new.quantity} pc(s) of ${payload.new.item}`,
            icon: 'i-lucide-circle-check',
            color: 'secondary',
          })
          triggerNotif(payload)
          console.log('notif', payload)
        }
      )
      .subscribe((status) => {
        if(status === 'SUBSCRIBED') {
          console.log('realtime connected')
        }
        if(status === 'CLOSED') {
          console.log('realtime connection error')
        }
      })
  }

  const setupNotification = async () => {
    if(!isNative) return

    let permission = await LocalNotifications.checkPermissions()
    if(permission.display !== 'granted') {
      await LocalNotifications.requestPermissions()
    }

    if(permission.display === 'granted') {
      await LocalNotifications.createChannel({
        id: 'borrow-alert3',
        name: 'Technical App',
        description: 'Setting up for notification',
        importance: 5,
        visibility: 1,
        vibrate: true
      })
    }
  }

  const triggerNotif = async (data) => {
    if(!isNative) {
      console.log('Web Notif:', data)
      return
    }

    await LocalNotifications.schedule({
      notifications: [{
        id: Math.floor(Math.random() * 2147483647),
        title: 'Technical App',
        body: `${data.new.borrower_name} wants to borrow ${data.new.quantity} pc(s) of ${data.new.item}`,
        channelId: 'borrow-alert3',
        schedule: { 
        allowWhileIdle: true
      },
      extra: { url: '/admin/borrowed-items' }
      }]
    })
  }

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

  onMounted(async () => {
    let status = await Network.getStatus()
    isOnline.value = status.connected
    let lastStatus = null

    if(isOnline.value) {
      await setupNotification()
      startAdminListener()
      console.log('App is online')
      //startForeground(true)
    }

    Network.addListener('networkStatusChange', (s) => {
      isOnline.value = s.connected

      if(lastStatus !== null && lastStatus.connected !== s.connected && lastStatus.connectionType !== s.connectionType) {
          console.log('ignored Network status changed:', s)
          return
      }

      lastStatus = s

      if (s.connected) {
        startAdminListener()
        console.log('App is back online status changed:', s)
      } else { 
        console.log('App is offline status changed:', s)
      }
    })

    if (isNative) {
      LocalNotifications.addListener('localNotificationActionPerformed', (notif) => {
        const url = notif.notification.extra?.url
        if (url) ionRouter.navigate(url, 'forward', 'push');
      })
    }

    App.addListener('backButton', (data) => {
      if(ionRouter.canGoBack()) {
        ionRouter.goBack()
      } else{
        isExitApp.value = true
      }
    })

  })

  onUnmounted(() => {
    //startForeground(false)
    // if(adminChannel) {
    //   supabase.removeChannel(adminChannel)
    // }
  })
  
</script>
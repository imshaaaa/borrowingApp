<template>
  <UApp :toaster="toaster">
    <div class="pt-[env(safe-area-inset-top)] fixed top-0 left-0 w-full py-[12px] px-4 shadow-sm bg-white flex items-center justify-between z-50">
      <div class="flex items-center">
        <UDrawer direction="left" v-model:open=open>
         <UButton icon="i-lucide-menu" size="xl" variant="ghost" color="neutral" />
          <template #content>
            <div class="min-w-60 px-4 py-6 pt-[env(safe-area-inset-top)]">
              <div class="flex gap-x-4">
                <UAvatar size="xl" loading="lazy" :src="`https://zijlzrpvfhkojhcpunas.supabase.co/storage/v1/object/public/profile_pictures/${userStore.user.id}?t=${userStore.user.pic_time_stamp}`" :alt="userStore.user.fullname"/>
                <p class="text-gray-800 font-bold">{{ userStore.user.firstname }} {{ userStore.user.middlename }} {{ userStore.user.lastname }} <span class="block text-xs text-gray-400">{{ userStore.user.user_type }}</span></p>
              </div>
              <div class="border border-gray-100 mt-4"></div>
              <div class="text-gray-800 mt-8 flex flex-col gap-2">
                <!--<UButton icon="i-lucide-layout-dashboard" size="lg" color="neutral" :variant="activePath === '/user/dashboard' ? 'solid' : 'ghost'" class="w-full" @click="toLink('dashboard')">Dashboard</UButton>-->
                <UButton icon="i-lucide-box" size="lg" :color="activePath === '/user/available-items' ? 'secondary' : 'neutral'" :variant="activePath === '/user/available-items' ? 'solid' : 'ghost'" class="w-full" @click="toLink('available-items')">Available Equipments</UButton>
                <UButton icon="i-lucide-list-restart" size="lg" :color="activePath ==='/user/request-monitoring' ? 'secondary' : 'neutral'" :variant="activePath === '/user/request-monitoring' ? 'solid' : 'ghost'" class="w-full" @click="toLink('request-monitoring')">Request Monitoring</UButton>
                <!--<UButton icon="i-lucide-bell" size="lg" color="neutral" variant="ghost" class="w-full" @click="toLink('notifications')">Notifications</UButton>-->
              </div>
            </div>
          </template>
        </UDrawer>
        <img src="~/assets/img/aclclogo.jpeg" class="h-9 inline ml-2"/>
      </div>
      <div>
        <UDropdownMenu :items="profileItems">
          <UAvatar loading="lazy" size="xl" :src="`https://zijlzrpvfhkojhcpunas.supabase.co/storage/v1/object/public/profile_pictures/${userStore.user.id}?t=${userStore.user.pic_time_stamp}`" :alt="userStore.user.fullname"/>
        </UDropdownMenu>
      </div>
    </div>
    <div>
      <slot />
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
  </UApp>
</template>

<script setup>
  import { useBackButton, useIonRouter } from '@ionic/vue';
  import { App } from '@capacitor/app';
  import { useRouter } from 'vue-router';
  import { onMounted } from 'vue';
  import { LocalNotifications } from '@capacitor/local-notifications'
import { Capacitor } from '@capacitor/core';
  
  const supabase = useSupabaseClient()
  const ionRouter = useIonRouter()
  const router = useRouter()
  const userStore = useUserStore()
  const toast = useToast()
  const open = ref(false)
  const isLogoutOpen = ref(false)
  const route = useRoute()
  const isExitApp = ref(false)
  const activePath = useState('activePath', () => route.path)
  let statusChannel= null
  const isNative = Capacitor.isNativePlatform()

  const exitApp = () => App.exitApp()
  
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
    duration: 3000,
    ui: {
      viewport: 'fixed flex flex-col w-[calc(100%-2rem)] sm:w-96 z-[100] focus:outline-none mt-10'
    }
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
    ionRouter.navigate('/user/profile', 'forward', 'push')
  }


  const handleLogout = async () => {
    isLogoutOpen.value = true
    
    if(statusChannel) {
      supabase.removeChannel(statusChannel)
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
    window.history.replaceState({}, '', '/login');
    ionRouter.replace('/login', 'root')
    //router.replace('/login')
    setTimeout(() => {
      toast.add({
        title: 'Logout Successfully!',
        description: 'You have been signed out successfully',
        icon: 'i-lucide-message-circle-check',
        color: 'secondary'
      
      })
    },500)
  }

   const borrowStatusListener = async () => {
    if(statusChannel) {
      supabase.removeChannel(statusChannel)
    }
    statusChannel = await supabase
      .channel('status-notif-channel')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tbl_borrowed_item',
          filter: `borrower_id=eq.${userStore.user.id}`
        }, (payload) => {
          console.log('request approved old val',  payload.old)

          if(payload.old.status !== payload.new.status) {
            if(payload.new.status == 'On Going') {
              toast.add({
                title: 'Borrow Request Approved!',
                description: `Your request of ${payload.new.item} has been approved!`,
                icon: 'i-lucide-message-circle-check',
                color: 'success'
              })
            }
            if(payload.new.status == 'Unreturned') {
              toast.add({
                title: 'Overdue Borrowed Equipment!',
                description: `Your borrowed ${payload.new.item} equipment is now overdue!`,
                icon: 'i-lucide-message-circle-check',
                color: 'warning'
              })
            }
            if(payload.new.status == 'Request Denied') {
              toast.add({
                title: 'Borrow Request Denied!',
                description: `Your request of ${payload.new.item} has been denied!`,
                icon: 'i-lucide-message-circle-x',
                color: 'error'
              })
            }
            if(payload.new.status == 'Returned') {
              toast.add({
                title: 'Equipment Returned!',
                description: `Your borrowed equipment ${payload.new.item} has been returned!`,
                icon: 'i-lucide-message-circle-check',
                color: 'success'
              })
            }
            if(payload.new.status == 'Request Expired') {
              toast.add({
                title: 'Request Expired!',
                description: `Your requested equipment ${payload.new.item} is expired!`,
                icon: 'i-lucide-message-circle-check',
                color: 'warning'
              })
            }
            triggerNotif(payload)
          }
        }
      )
      .subscribe((status) => {
        if(status == 'SUBSCRIBED') {
          console.log('realtime connected')
        }
        if(status == 'CLOSED') {
          console.log('realtime closed')
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
        id: 'status-alert5',
        name: 'Technical App',
        description: 'Setting up for notification',
        importance: 5,
        visibility: 1,
        vibrate: true
      })
    }
  }

  const triggerNotif = async (payload) => {

    let data

    if(!isNative) {
      console.log('Web Notif:', payload)
      return
    }

    if(payload.new.status == 'On Going') {
      data = `Your request of ${payload.new.item} have been approved!`
    }
    if(payload.new.status == 'Unreturned') {
      data = `Your borrowed ${payload.new.item} equipment is now overdue!`
    }
    if(payload.new.status == 'Request Denied') {
      data = `Your request of ${payload.new.item} has been denied!`
    }
    if(payload.new.status == 'Returned') {
      data = `Your borrowed equipment ${payload.new.item} has been return!`
    }
     if(payload.new.status == 'Request Expired') {
      data = `Your requested equipment ${payload.new.item} is expired!`
    }
    await LocalNotifications.schedule({
      notifications: [{
        id: Math.floor(Math.random() * 2147483647),
        title: 'Technical App',
        body: data,
        channelId: 'status-alert5',
        schedule: { 
        allowWhileIdle: true
      },
      extra: { url: '/user/request-monitoring' }
      }]
    })
  }



  onMounted(async () => {
    await setupNotification()
    borrowStatusListener()

    // if (isNative) {
    //   LocalNotifications.addListener('localNotificationActionPerformed', (notif) => {
    //     const url = notif.notification.extra?.url
    //     if (url) ionRouter.navigate(url, 'forward', 'push');
    //   })
    // }

    App.addListener('backButton', (data) => {
      let path = window.location.pathname
      // if(ionRouter.canGoBack()) {
      //   if(userStore.user.user_type == 'Student' || userStore.user.user_type =='Staff' || userStore.user.user_type == 'Teacher') {
      //     ionRouter.goBack()
      //   }
      //   console.log('path- user', path)
      //   console.log('can go back?', ionRouter.canGoBack)
      // } else{
      //   isExitApp.value = true
      // }

      let isAtRoot = route.path === '/user/available-items'
      
      if(isAtRoot) {
        isExitApp.value = true
        return
      }

      // if(ionRouter.canGoBack()) {
      //   ionRouter.back()
      // }
    })
  })

  // onUnmounted(() => {

  // })

  </script>
<template>
  <IonPage>
    <IonContent>
      <NuxtLayout>
        <div>
          <div class="flex flex-col gap-4">
            <UCard variant="outline" class="shadow px-2 py-2">
              <div class="flex justify-between">
                <p class="text-sm font-medium">Overall Statistics</p>
                <UIcon name="i-lucide-box" class="text-blue-500" />
              </div>
              <p class="text-2xl font-bold mt-4 text-gray-800">{{ user?.sub }}</p>
            </UCard>
            <UCard variant="outline" class="shadow px-2 py-2">
              <div class="flex justify-between">
                <p class="text-sm font-medium">Recently Borrowed</p>
                <UIcon name="i-lucide-workflow" class="text-blue-500" />
              </div>
              <p class="text-2xl font-bold mt-4 text-gray-800">43</p>
            </UCard>
            <UCard variant="outline" class="shadow px-2 py-2">
              <div class="flex justify-between">
                <p class="text-sm font-medium">Pending Requests</p>
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
          <div class="flex justify-center flex-wrap gap-2">
            <UButton @click="checkPermission">Check permission</UButton>
            <UButton @click="testNotif">Test Notif</UButton>
            <UButton @click="foregroundCheckPerm">Request Foreground Permission</UButton>
            <UButton @click="setToforeground">Set to Foreground Mode</UButton>
            <UButton @click="createNotificationChannel">Create Foreground Notification channel</UButton>
            <UButton @click="deleteNotificationChannel">Delete Foreground Notification channel</UButton>
            <UButton @click="startForegroundService">Start foreground</UButton>
            <UButton @click="stopForegroundService">Stop foreground</UButton>
          </div>
        </div>
      </NuxtLayout>
    </IonContent>
  </IonPage>
</template>

<script setup>

  import { LocalNotifications } from '@capacitor/local-notifications'
  import { ForegroundService } from '@capawesome-team/capacitor-android-foreground-service';

  
  definePageMeta({
    layout: 'admin'
  })

  const user = useSupabaseUser()
  const userStore = useUserStore()
  const supabase = useSupabaseClient()
  const ionRouter = useIonRouter()

  console.log(user.value)
  console.log(userStore.user)

  const checkPermission = async () => {
  try {
    let permission = await LocalNotifications.checkPermissions();
    console.log('Current status:', permission.display);

    if (permission.display !== 'granted') {
      permission = await LocalNotifications.requestPermissions();
    }

    if (permission.display === 'granted') {
      // Create the channel - essential for Android 8.0+
      await LocalNotifications.createChannel({
        id: 'test',
        name: 'Test',
        description: 'Setting up for notification',
        importance: 5,
        visibility: 1,
        vibration: true ,
        sound: 'default'
      });
      console.log('Channel created and permission granted');
    } else {
      console.log('Permission denied by user');
    }
  } catch (err) {
    console.error('Permission Error:', err);
  }
};

  const testNotif = async () => {
    try {
      await LocalNotifications.schedule({
        notifications: [{
          id: 9999,
          title: 'Technical App',
          body: 'New borrow request!',
          channelId: 'test',
          schedule: { 
          at: new Date(Date.now() + 500),
          allowWhileIdle: true
        },
        extra: { url: '/admin/borrowed-items' }
        }]
    })
    } catch(err) {
      console.log(err)
    }
  }

  const foregroundCheckPerm = async () => {
    await ForegroundService.requestManageOverlayPermission()
  }

  const setToforeground = async () => {
    await ForegroundService.moveToForeground()
  }

  const startForegroundService = async () => {
    await ForegroundService.startForegroundService({
      id: 1,
      title: 'Title',
      body: 'Body',
      smallIcon: 'ic_stat_icon_config_sample',
      buttons: [
        {
          title: 'Button 1',
          id: 1,
        },
        {
          title: 'Button 2',
          id: 2,
        },
      ],
      silent: false,
      notificationChannelId: 'default',
    });
  };

  const stopForegroundService = async () => {
    await ForegroundService.stopForegroundService();
  };

  const createNotificationChannel = async () => {
    try {
      await ForegroundService.createNotificationChannel({
        id: 'testForeground',
        name: 'Default',
        description: 'Default channel',
        importance: 5,
      });
    } catch (error) {
      console.log(error)
    }
    
  };

  const deleteNotificationChannel = async () => {
    await ForegroundService.deleteNotificationChannel({
      id: 'testForeground',
    });
  };

  onMounted(async() => {
    await
      LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
      const url = notificationAction.notification.extra?.url;
    
      if (url) {
        console.log('Redirecting to:', url);
        ionRouter.navigate(url, 'forward', 'push');
      }
    })

  const checkLaunchNotification = async () => {
    const notifications = await LocalNotifications.getDeliveredNotifications();
    if (notifications.notifications.length > 0) {
      // Process the most recent one if needed
      const lastNotif = notifications.notifications[0];
        if (lastNotif.extra?.url) {
          ionRouter.navigate(url, 'forward', 'push');
        }
    }
  }

    
  })

</script>
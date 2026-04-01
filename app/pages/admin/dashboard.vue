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
          <UButton @click="checkPermission">Check permission</UButton>
          <UButton @click="testNotif">Test Notif</UButton>
        </div>
      </NuxtLayout>
    </IonContent>
  </IonPage>
</template>

<script setup>

  import { LocalNotifications } from '@capacitor/local-notifications'

  
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
        vibration: true 
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
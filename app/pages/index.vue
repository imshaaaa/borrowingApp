<template>
  <IonPage>
    <IonContent>
  <div class="bg-white min-h-screen">
    <div class="flex flex-col items-center justify-center h-screen px-4 gap-y-8 text-center ">
      <img src="/img/aclclogo.jpeg" class="h-25 w-25" />
      <p class="text-3xl font-bold text-gray-800">ACLC Technical Borrowing System</p>
    </div>
    <div class="flex items-center justify-center -mt-30">
      <UButton color="neutral" variant="ghost" loading size="xl">{{ loadingMsg }} </UButton>
    </div>
  </div>
  </IonContent>
  </IonPage>
</template>

<script setup>

  //const { isConnected } = useNetwork()
  const ionRouter = useIonRouter()
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()
  const userStore = useUserStore()
  const toast = useToast()
  const router = useRouter()
  const loadingMsg = ref()

  const getUser = async () => {
    loadingMsg.value = 'Getting user data ...'
    try {
      console.log(user?.value)

      if(!user.value) {
        loadingMsg.value = 'redirecting to login ...'
        setTimeout(() => {
          toast.add({
            title: 'Session info',
            description: 'No session/user data has been save',
            icon: 'i-lucide-circle-x',
            color: 'secondary'
          })
          ionRouter.replace('/login', 'root')
          //router.replace('/login')
        }, 2000)
      }

      if(user.value) {
        let { data, error } = await supabase.from('tbl_users').select('*').eq('email', user?.value.email).maybeSingle()

        if(error) throw error

        if(data) {
          userStore.setUserData(data)
          await nextTick()

          if(data.user_type == 'Admin' || data.user_type == 'Technical Staff') {
            loadingMsg.value = 'redirecting to admin dashboard ...'
            setTimeout(() => {
              //ionRouter.replace('/admin/dashboard','root')
              router.replace('/admin/dashboard')
              setTimeout(() => {
                toast.add({
                  title: 'Welcome!',
                  description: `Welcome back ${userStore.user.firstname}`,
                  icon: 'i-lucide-message-circle-check',
                  color: 'secondary'
                
                })
              },500)
            })
          }

          if(data.user_type == 'Student' || data.user_type == 'Teacher' || data.user_type == 'Staff') {
            loadingMsg.value = 'redirecting to user page ...'
            setTimeout(() => {
              ionRouter.replace('/user/available-items','root')
              //router.replace('/user/available-items')
              setTimeout(() => {
                toast.add({
                  title: 'Welcome!',
                  description: `Welcome back ${userStore.user.firstname}`,
                  icon: 'i-lucide-message-circle-check',
                  color: 'secondary'
                
                })
              },500)
            }, 2000)
            
          }
        }
    }
    } catch (err) {
      toast.add({
        title: 'Application error',
        description: 'An error occured while processing data',
        icon: 'i-lucide-circle-x',
        color: 'error'
      })
      loadingMsg.value = 'Exit App?'
      console.log(err)
    }
  }

  definePageMeta({
    layout: 'default'
  })
  
  onMounted( () => {
    getUser()
  })

</script>
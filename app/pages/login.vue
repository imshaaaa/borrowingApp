<template>
  <IonPage>
    <IonContent>
  <div class="bg-blue-50 flex items-center justify-center h-screen px-6">
    <div class="bg-white p-6 border border-gray-100">
      <div class="flex justify-center">
        <img src="/img/aclclogo.jpeg" class="self-center h-17"/>
      </div>
      <p class="text-3xl font-bold text-center text-gray-800 mt-4">ACLC Technical Borrowing System</p>
      <p class="text-blue-800 text-center text-sm mt-2">Sign in to access your dashboard</p>
      <UForm :schema="schema" :state="state" @submit='onSubmit' ref="formRef">
        <div class="mt-6">
          <UFormField label="Username" name="username" :error="isUsernameError">
            <UInput v-model.trim="state.username" color="secondary" variant="subtle" size="xl" class="w-full ring-blue-600" placeholder="Username"/>
          </UFormField>
          <UFormField label="Password" name="password" class="mt-4" :error="isPassError">
            <UInput
              v-model.trim="state.password"
              color="secondary"
              size="xl"
              class="w-full"
              variant="subtle"
              placeholder="Password"
              :type="show ? 'text' : 'password'"
              :ui="{ trailing: 'pe-1'}"
            >
              <template #trailing>
                <UButton
                  color="neutral"
                  variant="link"
                  size="sm"
                  :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  :aria-label="show ? 'Hide password' : 'Show password'"
                  :aria-pressed="show"
                  aria-controls="password"
                  @click="show = !show"
                />
              </template>
            </UInput>
          </UFormField>
          <UButton v-if="!isLogin" type="submit" color="secondary" size="xl" class="flex justify-center w-full mt-6">Sign in</UButton>
          <UButton v-if="isLogin" color="secondary" size="xl" class="flex justify-center w-full mt-6" loading>Signing in...</UButton>
          <p class="text-center text-sm mt-4">Don't have an account? <span @click="toRegister" class='text-blue-600'>Register</span></p>
        </div>
      </UForm>
    </div>
  </div>
  </IonContent>
  </IonPage>
</template>

<script setup>
  import { useRouter } from 'vue-router'
import { object, string } from 'yup'
  
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const userStore = useUserStore()
  const ionRouter = useIonRouter()
  const router = useRouter()
  const toast = useToast()
  const show = ref(false)
  const formRef = ref(null)
  const isLogin = ref(false)
  const isUsernameError = ref(null)
  const isPassError = ref(null)
  
  const schema = object({
    username: string().trim().required("username is required"),
    password: string().trim().required("password is required")
  })
  
  const state = reactive({
    username: undefined,
    password: undefined
  })
  
  const onSubmit = async () => {
    
    isUsernameError.value = null
    isPassError.value = null
    isLogin.value = true
    
    try {
      
      const { data: userData, error: isUserErr } = await supabase.from('tbl_users').select('*').eq('username', state.username).maybeSingle()
      
      if(!userData) {
        isUsernameError.value = 'Username doesnt exists'
        isLogin.value = false
        return
      }

      if(isUserErr) {
        toast.add({
          title: 'Login Error',
          description: 'An error occured while verifying data',
          icon: 'i-lucide-user-x',
          color: 'error'
        })
        isLogin.value = false
        console.log(isUserErr)
        return
      }

      const { error: isLoginError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: state.password
      })

      if(isLoginError) {
        if(isLoginError.code == 'invalid_credentials') {
          isPassError.value = "Invalid password"
        }
        isLogin.value = false
        return
      }

      if(userData) {
  
        if(userData.status == 'Pending') {
          await supabase.auth.signOut()
          toast.add({
            title: 'Invalid Account',
            description: 'Wait for admin approval',
            icon: 'i-lucide-user-x',
            color: 'warning'
          })
          isLogin.value = false
          return
        }
        
        if(userData.status == 'Approved'){
          await userStore.setUserData(userData)
          await nextTick()
          if(userStore.user.user_type == 'Admin') {
             await router.replace('/admin/dashboard')
            setTimeout(() => {
              toast.add({
                title: 'Welcome!',
                description: `Welcome back ${userStore.user.firstname}`,
                icon: 'i-lucide-message-circle-check',
                color: 'secondary'
              
              })
            },500)
            console.log('success?')
          
          }
          if(userData.user_type == 'Student' || userData.user_type == 'Teacher' || userData.user_type == 'Staff') {
            await router.replace('/user/dashboard')
            setTimeout(() => {
              toast.add({
                title: 'Welcome!',
                description: `Welcome back ${userStore.user.firstname}`,
                icon: 'i-lucide-message-circle-check',
                color: 'secondary'
              
              })
            },500)
          }
        }
        
      }
    
      
    } catch(err) {
      toast.add({
        title: 'Application error',
        description: 'An error occured while processing data',
        icon: 'i-lucide-circle-x',
        color: 'error'
      })
      console.log(err)
    }
  }
  
  const resetForm = () => {
    formRef.value?.clear()
    state.username = ""
    state.password = ""
  }
  
  const toRegister = () => {
    resetForm()
    ionRouter.navigate('/register', 'forward', 'push')
  }

  onMounted(() => {
    console.log('login',user.value)
    console.log('login-user-store',userStore.value)
  })
</script>
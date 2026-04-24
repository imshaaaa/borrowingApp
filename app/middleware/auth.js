export default defineNuxtRouteMiddleware(async(to) => {

  const user = useSupabaseUser()
  const supabase = useSupabaseClient()
  const userStore = useUserStore()
  //const route = useRoute()

  // if(!user.value && to.path !== 'login') {
  //   console.log('userInfo', user)
  //   return navigateTo('/login', { replace: true })
  // }

  // if(userStore.user && userStore.user.user_type !== 'Admin' || userStore.user.user_type !== 'Technical Staff'  && to.path.includes('/admin')) {
  //   setPageLayout('user')
  //   return navigateTo('/user/available-items', { replace: true })
  // }

  // if(userStore.user && userStore.user.user_type !== 'Student' || userStore.user.user_type !== 'Staff' || userStore.user.user_type !== 'Teacher'  && to.path.includes('/user')) {
  //   setPageLayout('admin')
  //   return navigateTo('/admin/dashboard', { replace: true })
  // }

  // if(user.value && to.path === '/login') {
  //   let { data, error } = await supabase.from('tbl_users').select('*').eq('email', user.value.email).maybeSingle()
  //   //if(error) return navigateTo('/lo')

  //   if(data && data.user_type == 'Admin') {
  //     return navigateTo('/admin/dashboard', { replace: true })
  //   }

  //   if(data && data.user_type == 'Student' || data.user_type == 'Staff' || data.user_type == 'Teacher') {
  //     return navigateTo('/user/available-items', { replace: true })
  //   }
  //   console.log('redirect?', data)
  // }

  // if(user.value && to.path == '/login') {
  //   console.log('redirect')
  // } 

  //const { $pinia } = useNuxtApp()
  //const userStore = useUserStore($pinia)

  // //const { $pinia } = useNuxtApp()
  // const user = useSupabaseUser()
  // const supabase = useSupabaseClient()

  // const publicRoutes = to.path === '/login' || to.path === '/register'

  // if(!userStore.user?.id && !publicRoutes) {
  //   console.log('happened here?')
  //   //await supabase.auth.signOut()
  //   setPageLayout('default')
  //   return navigateTo('/login', { replace: true })
  // }

  // if(to.path === '/') {
  //   setTimeout(() => {
  //     return user.value ? navigateTo('/admin/dashboard', { replace: true }) : navigateTo('/login', { replace: true })
  //   },2000)
    
  // }

  // if(user.value && publicRoutes) {
  //   if(!userStore.user) {
      
  //     const { data: userData, error: isError } = await supabase.from('tbl_users').select('*').eq('user_uid',user.value.sub).maybeSingle()
  
  //     if(isError) {
  //       await supabase.auth.signOut()
  //       userStore.$reset()
  //       return navigateTo('/login', { replace: true })
  //     }
  //     await userStore.setUserData(userData)
  //   }

  //   if(userStore.user.user_type == 'Admin' || userStore.user.user_type == 'Technical Staff') {
  //     return navigateTo('/admin/dashboard', { replace: true })
  //   }
  //   if(userStore.user.user_type == 'Student' || userStore.user.user_type == 'Teacher' || userStore.user.user_type == 'Staff') {
  //     return navigateTo('/user/available-items', { replace: true })
  //   }
  // } else {
  //   console.log(user.value)
  //   // await supabase.auth.signOut()
  //   // userStore.$reset()
  //   // setPageLayout('default')
  //   // return navigateTo('/login', { replace: true })
  // }
})
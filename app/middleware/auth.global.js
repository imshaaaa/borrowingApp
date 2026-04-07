export default defineNuxtRouteMiddleware(async(to) => {
  const { $pinia } = useNuxtApp()
  const user = useSupabaseUser()
  const userStore = useUserStore($pinia)
  const supabase = useSupabaseClient()

  const publicRoutes = to.path === '/login' || to.path === '/register'

  if(!userStore.user.id && !publicRoutes) {
    console.log('happened here?')
    //supabase.auth.signOut()
    setPageLayout('default')
    return navigateTo('/login', { replace: true })
  }

  if(to.path === '/') {
    setTimeout(() => {
      return user.value ? navigateTo('/admin/dashboard', { replace: true }) : navigateTo('/login', { replace: true })
    },2000)
    
  }

  if(user.value && publicRoutes) {
    if(!userStore.user.value && userStore.user.status == 'Approved') {
      
      const { data: userData, error: isError } = await supabase.from('tbl_users').select('*').eq('user_uid',user.value.sub).maybeSingle()
  
      if(isError) {
        await supabase.auth.signOut()
        userStore.$reset()
        return navigateTo('/login', { replace: true })
      }
      await userStore.setUserData(userData)
    }

    if(userStore.user.user_type == 'Admin') {
      return navigateTo('/admin/dashboard', { replace: true })
    }
    if(userStore.user.user_type == 'Student') {
      return navigateTo('/user/dashboard', { replace: true })
    }
  } else {
    await supabase.auth.signOut()
    userStore.$reset()
    setPageLayout('default')
    return navigateTo('/login', { replace: true })
  }
})
export default defineNuxtRouteMiddleware((to) => {
  if(to.path.startsWith('/admin')) {
    setPageLayout('admin')
  } else if(to.path.startsWith('/user')) {
    setPageLayout('user')
  }
})
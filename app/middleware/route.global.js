export default defineNuxtRouteMiddleware((to, from) => {
    const activePath = useState('activePath')
    activePath.value = to.path
})
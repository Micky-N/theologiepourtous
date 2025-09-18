import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware((to) => {
    const { isLoggedIn } = useAuth()

    if (!isLoggedIn.value) {
        return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
    }
})

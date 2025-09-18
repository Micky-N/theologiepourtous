import { useAuth } from '~/composables/useAuth'

export default defineNuxtPlugin(async () => {
    const { initAuth } = useAuth()

    // Initialiser l'état d'authentification côté client
    if (import.meta.client) {
        await initAuth()
    }
})

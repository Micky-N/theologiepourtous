import type { UserWithoutPassword } from '../types'

export const useAuth = () => {
    // État global de l'utilisateur
    const user = useState<UserWithoutPassword | null>('auth.user', () => null)
    const isLoggedIn = computed(() => !!user.value)

    // Inscription
    const register = async (data: {
        name: string
        email: string
        password: string
    }) => {
        try {
            const response = await $fetch<{
                success: boolean
                message: string
                user: UserWithoutPassword
            }>('/api/auth/register', {
                method: 'POST',
                body: data
            })

            if (response.success) {
                user.value = response.user
                await navigateTo('/')
            }

            return response
        } catch (error: any) {
            console.error('Erreur lors de l\'inscription:', error)
            throw error
        }
    }

    // Connexion
    const login = async (data: {
        email: string
        password: string
    }) => {
        try {
            const response = await $fetch<{
                success: boolean
                message: string
                user: UserWithoutPassword
            }>('/api/auth/login', {
                method: 'POST',
                body: data
            })

            if (response.success) {
                user.value = response.user
                await navigateTo('/')
            }

            return response
        } catch (error: any) {
            console.error('Erreur lors de la connexion:', error)
            throw error
        }
    }

    // Déconnexion
    const logout = async () => {
        try {
            await $fetch('/api/auth/logout', {
                method: 'POST'
            })

            user.value = null
            await navigateTo('/login')
        } catch (error: any) {
            console.error('Erreur lors de la déconnexion:', error)
            // Même en cas d'erreur serveur, on déconnecte côté client
            user.value = null
            await navigateTo('/login')
        }
    }

    // Récupérer l'utilisateur actuel
    const fetchUser = async () => {
        try {
            const response = await $fetch<{
                success: boolean
                user: UserWithoutPassword
            }>('/api/auth/me')

            if (response.success) {
                user.value = response.user
            }

            return response
        } catch (error: any) {
            console.error('Erreur lors de la récupération de l\'utilisateur:', error)
            // Si l'utilisateur n'est pas authentifié, on le déconnecte
            if (error.statusCode === 401) {
                user.value = null
            }
            throw error
        }
    }

    // Initialiser l'état d'authentification
    const initAuth = async () => {
        try {
            await fetchUser()
        } catch {
            // Ignore l'erreur si l'utilisateur n'est pas connecté
            user.value = null
        }
    }

    return {
        user: readonly(user),
        isLoggedIn,
        register,
        login,
        logout,
        fetchUser,
        initAuth
    }
}

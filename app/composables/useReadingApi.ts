import type { BibleVersion, ReadingSession } from '~/generated/prisma'
import type {
    ReadingStatsResponse,
    CreateReadingSessionPayload,
    UpdateReadingSessionPayload,
    ComparisonRequest,
    BibleComparison
} from '~/types'

/**
 * Composable pour gérer les statistiques de lecture
 */
export const useReadingStats = () => {
    const stats = ref<ReadingStatsResponse | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    const fetchStats = async (period: string = '30days') => {
        loading.value = true
        error.value = null

        try {
            const { data } = await $fetch<{ success: boolean, data: ReadingStatsResponse }>(
                `/api/reading/stats?period=${period}`
            )
            stats.value = data
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erreur lors de la récupération des statistiques'
        } finally {
            loading.value = false
        }
    }

    return {
        stats: readonly(stats),
        loading: readonly(loading),
        error: readonly(error),
        fetchStats
    }
}

/**
 * Composable pour gérer les sessions de lecture
 */
export const useReadingSessions = () => {
    const currentSession = ref<ReadingSession | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    const startSession = async (payload: CreateReadingSessionPayload) => {
        loading.value = true
        error.value = null

        try {
            const session = await $fetch<ReadingSession>('/api/reading/sessions', {
                method: 'POST',
                body: payload
            })
            currentSession.value = session
            return session
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erreur lors du démarrage de la session'
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateSession = async (sessionId: number, payload: UpdateReadingSessionPayload) => {
        loading.value = true
        error.value = null

        try {
            const session = await $fetch<ReadingSession>(`/api/reading/sessions/${sessionId}`, {
                method: 'PATCH',
                body: payload
            })
            currentSession.value = session
            return session
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la session'
            throw err
        } finally {
            loading.value = false
        }
    }

    const endSession = async (sessionId: number, duration: number, chaptersRead: string[], versesRead: number) => {
        return updateSession(sessionId, {
            endTime: new Date(),
            duration,
            chaptersRead,
            versesRead,
            isCompleted: true
        })
    }

    return {
        currentSession: readonly(currentSession),
        loading: readonly(loading),
        error: readonly(error),
        startSession,
        updateSession,
        endSession
    }
}

/**
 * Composable pour la comparaison de versions bibliques
 */
export const useBibleComparison = () => {
    const comparison = ref<BibleComparison | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    const compareVerses = async (request: ComparisonRequest) => {
        loading.value = true
        error.value = null

        try {
            const result = await $fetch<BibleComparison>('/api/bible/compare', {
                method: 'POST',
                body: request
            })
            comparison.value = result
            return result
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erreur lors de la comparaison'
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        comparison: readonly(comparison),
        loading: readonly(loading),
        error: readonly(error),
        compareVerses
    }
}

/**
 * Composable pour gérer les versions bibliques
 */
export const useBibleVersions = () => {
    const versions = ref<BibleVersion[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const fetchVersions = async () => {
        if (versions.value.length > 0) return versions.value

        loading.value = true
        error.value = null

        try {
            const result = await $fetch<BibleVersion[]>('/api/bible/versions')
            versions.value = result
            return result
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erreur lors de la récupération des versions'
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        versions: readonly(versions),
        loading: readonly(loading),
        error: readonly(error),
        fetchVersions
    }
}

/**
 * Composable pour le formatage des données de statistiques
 */
export const useStatsFormatting = () => {
    const formatDuration = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)

        if (hours > 0) {
            return `${hours}h ${minutes}m`
        }
        return `${minutes}m`
    }

    const formatPercentage = (value: number, total: number): string => {
        if (total === 0) return '0%'
        return `${Math.round((value / total) * 100)}%`
    }

    const formatDate = (date: Date | string): string => {
        return new Intl.DateTimeFormat('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }).format(new Date(date))
    }

    const formatRelativeTime = (date: Date | string): string => {
        const now = new Date()
        const targetDate = new Date(date)
        const diffMs = now.getTime() - targetDate.getTime()
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return 'Aujourd\'hui'
        if (diffDays === 1) return 'Hier'
        if (diffDays < 7) return `Il y a ${diffDays} jours`
        if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`
        return formatDate(date)
    }

    return {
        formatDuration,
        formatPercentage,
        formatDate,
        formatRelativeTime
    }
}

/**
 * Composable pour les préférences utilisateur
 */
export const useUserPreferences = () => {
    const preferences = ref({
        defaultVersion: 'LSG',
        showVerseNumbers: true,
        fontSize: 'medium' as 'small' | 'medium' | 'large',
        theme: 'light' as 'light' | 'dark' | 'sepia',
        dailyReadingGoal: 15, // minutes
        notifications: {
            enabled: true,
            reminderTime: '08:00',
            frequency: 'daily' as 'daily' | 'weekly' | 'none'
        }
    })

    const updatePreference = <K extends keyof typeof preferences.value>(
        key: K,
        value: typeof preferences.value[K]
    ) => {
        preferences.value[key] = value
        // TODO: Sauvegarder en base de données
    }

    return {
        preferences: readonly(preferences),
        updatePreference
    }
}

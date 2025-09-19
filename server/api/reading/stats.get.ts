import prisma from '~~/lib/prisma'
import type { ReadingStats, BibleReadingProgress } from '~/generated/prisma'
import type { ReadingStatsResponse } from '~/types'

type ProgressWithBook = BibleReadingProgress & {
    book: { name: string, chapterCount: number }
}

export default defineEventHandler(async (event): Promise<ReadingStatsResponse> => {
    try {
        const query = getQuery(event)
        const user = await requireAuth(event)

        const period = (query.period as string) || '30days'
        const { startDate, endDate } = getPeriodDates(period)

        // Requêtes de base avec types simplifiés
        const totalSessions = await prisma.readingSession.count({
            where: {
                userId: user.id,
                startTime: { gte: startDate, lte: endDate },
                isCompleted: true
            }
        })

        const totalReadingTime = await prisma.readingSession.aggregate({
            where: {
                userId: user.id,
                startTime: { gte: startDate, lte: endDate },
                isCompleted: true
            },
            _sum: { duration: true }
        })

        const totalVersesRead = await prisma.readingSession.aggregate({
            where: {
                userId: user.id,
                startTime: { gte: startDate, lte: endDate },
                isCompleted: true
            },
            _sum: { versesRead: true }
        })

        // Statistiques quotidiennes basiques
        const dailyStats = await prisma.readingStats.findMany({
            where: {
                userId: user.id,
                date: { gte: startDate, lte: endDate }
            },
            orderBy: { date: 'asc' },
            select: {
                date: true,
                totalReadingTime: true,
                versesRead: true,
                sessionsCount: true,
                chaptersCompleted: true
            }
        }) as ReadingStats[]

        // Progression par livre basique
        const bookProgress = await prisma.bibleReadingProgress.findMany({
            where: {
                userId: user.id,
                lastReadAt: { gte: startDate }
            },
            include: { book: true },
            orderBy: { lastReadAt: 'desc' },
            take: 5
        }) as ProgressWithBook[]

        return {
            summary: {
                totalSessions,
                totalReadingTime: totalReadingTime._sum.duration || 0,
                totalVersesRead: totalVersesRead._sum.versesRead || 0,
                currentStreak: await calculateCurrentStreak(user.id),
                longestStreak: 0, // Simplifié pour l'instant
                averages: {
                    readingTimePerDay: totalSessions > 0
                        ? (totalReadingTime._sum.duration || 0) / totalSessions
                        : 0,
                    versesPerSession: totalSessions > 0
                        ? (totalVersesRead._sum.versesRead || 0) / totalSessions
                        : 0,
                    averageReadingSpeed: 0 // À calculer plus tard
                }
            },
            dailyStats: dailyStats.map((stat: ReadingStats) => ({
                date: stat.date,
                readingTime: stat.totalReadingTime,
                versesRead: stat.versesRead,
                sessions: stat.sessionsCount,
                chaptersCompleted: stat.chaptersCompleted
            })),
            bookProgress: bookProgress.map((progress: ProgressWithBook) => ({
                book: progress.book.name,
                currentChapter: progress.currentChapter,
                currentVerse: progress.currentVerse,
                completionPercentage: progress.book.chapterCount > 0
                    ? Math.round((progress.currentChapter / progress.book.chapterCount) * 100)
                    : 0,
                lastReadAt: progress.lastReadAt,
                isCompleted: progress.isCompleted
            })),
            topBooks: [], // À implémenter
            timePreferences: {} // À implémenter
        }
    } catch (error) {
        console.error('Erreur récupération statistiques:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur lors de la récupération des statistiques'
        })
    }
})

function getPeriodDates(period: string) {
    const now = new Date()
    const startDate = new Date()

    switch (period) {
        case '7days':
            startDate.setDate(now.getDate() - 7)
            break
        case '30days':
            startDate.setDate(now.getDate() - 30)
            break
        case '90days':
            startDate.setDate(now.getDate() - 90)
            break
        case '365days':
        case '1year':
            startDate.setFullYear(now.getFullYear() - 1)
            break
        default:
            startDate.setDate(now.getDate() - 30)
    }

    return { startDate, endDate: now }
}

async function requireAuth(_event: any) {
    // TODO: Implémenter l'authentification réelle
    return { id: 1 }
}

async function calculateCurrentStreak(userId: number): Promise<number> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let currentStreak = 0
    const checkDate = new Date(today)

    while (currentStreak < 365) { // Limite pour éviter les boucles infinies
        const dayStats = await prisma.readingStats.findUnique({
            where: {
                userId_date: {
                    userId,
                    date: checkDate
                }
            }
        })

        if (!dayStats || dayStats.sessionsCount === 0) {
            break
        }

        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
    }

    return currentStreak
}

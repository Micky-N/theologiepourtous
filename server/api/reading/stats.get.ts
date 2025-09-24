import prisma from '~~/lib/prisma';
import type { ProgressWithBook, ReadingStats, ReadingStatsResponse } from '~/types';

type ChapterRead = {
    bookCode: string
    chaptersId: number[]
};

export default defineEventHandler(async (event): Promise<ReadingStatsResponse> => {
    try {
        const query = getQuery(event);
        const { user: userSession } = await getUserSession(event);

        if (!userSession) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Non autorisé'
            });
        }

        const userId = userSession.id;

        const period = (query.period as string) || '30days';
        const { startDate, endDate } = getPeriodDates(period);

        // Requêtes de base avec types simplifiés
        const allSessions = await prisma.readingSession.findMany({
            where: {
                userId,
                startTime: { gte: startDate, lte: endDate },
                isCompleted: true
            }
        });

        const totalReadingTime = await prisma.readingSession.aggregate({
            where: {
                userId,
                startTime: { gte: startDate, lte: endDate },
                isCompleted: true
            },
            _sum: { duration: true }
        });

        function onlyUnique<T>(value: T, index: number, array: T[]) {
            return array.indexOf(value) === index;
        }

        const totalChaptersRead = allSessions.reduce(
            (acc, session) => acc + (JSON.parse(session.chaptersRead || '[{"bookCode": "GEN", "chaptersId": []}]') as ChapterRead[])
                .reduce((acc, chapter) => acc + chapter.chaptersId.filter(onlyUnique).length, 0),
            0);

        const totalSessions = allSessions.length;
        // Statistiques quotidiennes basiques
        const dailyStats: ReadingStats[] = [];

        // Progression par livre basique
        const bookProgress: ProgressWithBook[] = [];

        return {
            summary: {
                totalSessions,
                totalReadingTime: totalReadingTime._sum.duration || 0,
                totalChaptersRead: totalChaptersRead,
                currentStreak: await calculateCurrentStreak(userId),
                longestStreak: 0, // Simplifié pour l'instant
                averages: {
                    readingTimePerDay: totalSessions > 0
                        ? (totalReadingTime._sum.duration || 0) / totalSessions
                        : 0,
                    chaptersPerSession: totalSessions > 0
                        ? totalChaptersRead / totalSessions
                        : 0,
                    averageReadingSpeed: 0 // À calculer plus tard
                }
            },
            dailyStats: dailyStats,
            bookProgress: bookProgress,
            topBooks: [], // À implémenter
            timePreferences: {} // À implémenter
        };
    } catch (error) {
        console.error('Erreur récupération statistiques:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur lors de la récupération des statistiques'
        });
    }
});

function getPeriodDates(period: string) {
    const now = new Date();
    const startDate = new Date();

    switch (period) {
        case '7days':
            startDate.setDate(now.getDate() - 7);
            break;
        case '30days':
            startDate.setDate(now.getDate() - 30);
            break;
        case '90days':
            startDate.setDate(now.getDate() - 90);
            break;
        case '365days':
        case '1year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        default:
            startDate.setDate(now.getDate() - 30);
    }

    return { startDate, endDate: now };
}

async function calculateCurrentStreak(userId: number): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentStreak = 0;
    const checkDate = new Date(today);

    while (currentStreak < 365) { // Limite pour éviter les boucles infinies
        const dayStats = await prisma.readingSession.findMany({
            where: {
                userId: userId,
                startTime: {
                    gte: checkDate,
                    lt: new Date(checkDate.getTime() + 86400000) // +1 jour
                }
            }
        });

        if (!dayStats || dayStats.length === 0) {
            break;
        }

        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
    }

    return currentStreak;
}

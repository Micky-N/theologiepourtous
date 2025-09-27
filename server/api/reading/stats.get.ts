import prisma from '~~/lib/prisma';
import type { ProgressWithBook, ReadingStats, ReadingStatsResponse } from '~/types';

type ChapterRead = {
    bookCode: string
    chaptersId: number[]
};

type SessionChapterLine = {
    dayKey: string
    versionId: number
    bookCode: string
    chapter: number
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

        // Récupère les sessions dans la période
        const allSessions = await prisma.readingSession.findMany({
            where: {
                userId,
                startTime: { gte: startDate, lte: endDate },
                isCompleted: true
            }
        });

        const totalReadingTimeAgg = await prisma.readingSession.aggregate({
            where: {
                userId,
                startTime: { gte: startDate, lte: endDate },
                isCompleted: true
            },
            _sum: { duration: true }
        });

        const totalSessions = allSessions.length;

        // Aides
        const parseChapters = (payload?: string | null): ChapterRead[] => {
            if (!payload) return [];
            try {
                const parsed = JSON.parse(payload);
                if (Array.isArray(parsed)) return parsed as ChapterRead[];
                return [];
            } catch {
                return [];
            }
        };

        function onlyUnique(value: any, index: number, array: any[]) {
            return array.indexOf(value) === index;
        }

        // Agrégations intermédiaires
        const dailyMap = new Map();
        const chaptersByBook = new Map<string, Set<number>>();
        const lastReadAtByBook = new Map<string, Date>();
        const topBooksMap = new Map();
        const hourPrefs = new Map<number, number>();

        let totalReadingTime = 0;
        let totalChaptersRead = 0;
        const sessionChapterLines: SessionChapterLine[] = [];

        for (const s of allSessions) {
            const duration = s.duration || 0;
            totalReadingTime += duration;

            // Heure préférée
            const hour = new Date(s.startTime).getHours();
            hourPrefs.set(hour, (hourPrefs.get(hour) || 0) + 1);

            // Daily stats (groupement par jour)
            const day = new Date(s.startTime);
            day.setHours(0, 0, 0, 0);
            const key = day.toISOString();
            if (!dailyMap.has(key)) {
                dailyMap.set(key, { date: new Date(day), totalReadingTime: 0, chaptersRead: 0, sessionsCount: 0, versesRead: 0 });
            }
            const agg: any = dailyMap.get(key)!;
            agg.totalReadingTime += duration;
            agg.sessionsCount += 1;

            // Chapitres lus par session
            const chapterReads = parseChapters(s.chaptersRead);
            // Pour top books, on utilisera la présence du livre dans la session
            const seenBooksInSession = new Set<string>();
            for (const cr of chapterReads) {
                const uniqChapters = (cr.chaptersId || []).filter(onlyUnique);
                if (uniqChapters.length > 0) {
                    totalChaptersRead += uniqChapters.length;
                    agg.chaptersRead += uniqChapters.length;
                }

                if (!chaptersByBook.has(cr.bookCode)) {
                    chaptersByBook.set(cr.bookCode, new Set<number>());
                }
                const set = chaptersByBook.get(cr.bookCode)!;
                uniqChapters.forEach(c => set.add(c));
                lastReadAtByBook.set(cr.bookCode, new Date(s.startTime));

                seenBooksInSession.add(cr.bookCode);

                // Collecte pour calculer les versets lus (clé par session/jour)
                for (const ch of uniqChapters) {
                    sessionChapterLines.push({ dayKey: key, versionId: s.versionId, bookCode: cr.bookCode, chapter: ch });
                }
            }

            // Top books: incrémente pour les livres présents dans la session
            for (const bookCode of seenBooksInSession) {
                if (!topBooksMap.has(bookCode)) topBooksMap.set(bookCode, { sessions: 0, totalTime: 0 });
                const t: any = topBooksMap.get(bookCode)!;
                t.sessions += 1;
                t.totalTime += duration;
            }
        }

        // On calculera dailyStats après le calcul des versets lus

        // Récupère infos des livres nécessaires
        const involvedBookCodes = Array.from(new Set([
            ...Array.from(chaptersByBook.keys()),
            ...Array.from(topBooksMap.keys())
        ]));

        let booksByCode = new Map();
        if (involvedBookCodes.length > 0) {
            const books = await prisma.bibleBook.findMany({
                where: { code: { in: involvedBookCodes } },
                select: { id: true, code: true, name: true, chapterCount: true, testament: true }
            });
            booksByCode = new Map(books.map(b => [b.code, b]));
        }

        // Calculer les versets lus par (versionId, bookId, chapter)
        const booksByCodeAny: Map<string, any> = booksByCode as any;
        const tupleKeys = new Set<string>();
        const orFilters: any[] = [];
        for (const line of sessionChapterLines) {
            const book: any = booksByCodeAny.get(line.bookCode);
            if (!book) continue;
            const k = `${line.versionId}:${book.id}:${line.chapter}`;
            if (!tupleKeys.has(k)) {
                tupleKeys.add(k);
                orFilters.push({ versionId: line.versionId, bookId: book.id, chapter: line.chapter });
            }
        }

        let countsMap = new Map<string, number>();
        if (orFilters.length > 0) {
            const grouped = await prisma.bibleVerse.groupBy({
                by: ['versionId', 'bookId', 'chapter'],
                where: { OR: orFilters },
                _count: { _all: true }
            });
            countsMap = new Map(grouped.map((g: any) => [`${g.versionId}:${g.bookId}:${g.chapter}`, g._count._all as number]));
        }

        for (const line of sessionChapterLines) {
            const book: any = booksByCodeAny.get(line.bookCode);
            if (!book) continue;
            const k = `${line.versionId}:${book.id}:${line.chapter}`;
            const count = countsMap.get(k) || 0;
            const agg: any = dailyMap.get(line.dayKey);
            if (agg) agg.versesRead = (agg.versesRead || 0) + count;
        }

        // Construit dailyStats triés chronologiquement (incluant versesRead)
        const dailyStats: ReadingStats[] = Array.from(dailyMap.values())
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map(d => ({
                date: d.date,
                totalReadingTime: d.totalReadingTime,
                chaptersRead: d.chaptersRead,
                versesRead: d.versesRead || 0,
                sessionsCount: d.sessionsCount
            }));

        // Progression par livre
        const bookProgress: ProgressWithBook[] = [];
        for (const [code, chaptersSet] of chaptersByBook.entries()) {
            const book: any = booksByCode.get(code);
            if (!book) continue;
            const readCount = chaptersSet.size;
            const completion = book.chapterCount > 0 ? Math.min(100, Math.round((readCount / book.chapterCount) * 100)) : 0;
            bookProgress.push({
                book,
                completionPercentage: completion,
                lastReadAt: lastReadAtByBook.get(code) || new Date(),
                isCompleted: readCount >= book.chapterCount
            });
        }

        // Top livres (tri décroissant par sessions puis totalTime)
        const topBooks = Array.from(topBooksMap.entries())
            .map(([code, v]) => ({ code, ...v }))
            .map(b => ({
                name: booksByCode.get(b.code)?.name || b.code,
                sessions: b.sessions,
                totalTime: b.totalTime
            }))
            .sort((a, b) => (b.sessions - a.sessions) || (b.totalTime - a.totalTime));

        // Préférences horaires
        const timePreferences: Record<string, number> = {};
        for (let h = 0; h < 24; h++) {
            timePreferences[String(h)] = hourPrefs.get(h) || 0;
        }

        // Moyennes
        const activeDays = dailyStats.filter(d => d.sessionsCount > 0).length || 1;
        const averages = {
            readingTimePerDay: totalReadingTime / activeDays,
            chaptersPerSession: totalSessions > 0 ? totalChaptersRead / totalSessions : 0
        };

        // Longest streak à partir des dailyStats
        const longestStreak = calculateLongestStreak(dailyStats);

        return {
            summary: {
                totalSessions,
                totalReadingTime: totalReadingTimeAgg._sum.duration || totalReadingTime,
                totalChaptersRead,
                currentStreak: await calculateCurrentStreak(userId),
                longestStreak,
                averages
            },
            dailyStats,
            bookProgress,
            topBooks,
            timePreferences
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

function calculateLongestStreak(dailyStats: ReadingStats[]): number {
    if (!dailyStats.length) return 0;
    // Assure tri par date
    const days = dailyStats
        .filter(d => d.sessionsCount > 0)
        .map((d) => {
            const dt = new Date(d.date);
            dt.setHours(0, 0, 0, 0);
            return dt.getTime();
        })
        .sort((a, b) => a - b);

    if (!days.length) return 0;

    let longest = 1;
    let current = 1;
    for (let i = 1; i < days.length; i++) {
        const curr = days[i]!;
        const prev = days[i - 1]!;
        const diff = curr - prev;
        if (diff === 86400000) {
            current += 1;
            longest = Math.max(longest, current);
        } else if (diff > 0) {
            current = 1;
        }
    }
    return longest;
}

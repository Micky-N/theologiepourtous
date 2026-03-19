import { prisma } from '~~/lib/prisma';
import {
    buildBookPayload,
    buildVersePreview,
    getBibleBookByCode,
    getBibleBookByOrderIndex,
    getBibleVersionByCode,
    getBibleVersionByOrderIndex
} from '~~/server/utils/bibleData';

export default defineEventHandler(async (event) => {
    try {
        // Vérifier l'authentification
        const { user: userSession } = await getUserSession(event);

        if (!userSession) {
            throw createError({
                statusCode: 401,
                message: 'Non autorisé'
            });
        }

        const preferences = await prisma.userPreference.findUnique({
            where: { userId: userSession.id }
        });

        const userId = userSession.id;

        const query = getQuery(event);
        const bookCode = query.book as string | undefined;
        const limit = Math.min(parseInt(query.limit as string) || 50, 100);
        const offset = parseInt(query.offset as string) || 0;

        const whereClause: any = {
            userId
        };

        // Filtrer par livre si spécifié
        if (bookCode) {
            const book = await getBibleBookByCode(bookCode);
            if (book) {
                whereClause.bookOrderIndex = book.orderIndex;
            }

            // Filtrer par chapitre si spécifié
            if (query.chapter) {
                whereClause.chapter = parseInt(query.chapter as string);
            }

            if (preferences?.bookmarksPerVersion) {
                const versionCode = (query.version as string | undefined)?.toUpperCase();
                const version = versionCode
                    ? await getBibleVersionByCode(versionCode)
                    : preferences?.defaultVersionOrderIndex
                        ? await getBibleVersionByOrderIndex(preferences.defaultVersionOrderIndex)
                        : await getBibleVersionByCode('LSG');
                if (version) {
                    whereClause.versionOrderIndex = version.orderIndex;
                }
            }
        }

        const [bookmarks, total] = await Promise.all([
            prisma.bibleBookmark.findMany({
                where: whereClause,
                orderBy: {
                    createdAt: 'desc'
                },
                take: limit,
                skip: offset
            }),
            prisma.bibleBookmark.count({ where: whereClause })
        ]);

        const formattedBookmarks = await Promise.all(bookmarks.map(async (bookmark) => {
            const [book, version] = await Promise.all([
                getBibleBookByOrderIndex(bookmark.bookOrderIndex),
                getBibleVersionByOrderIndex(bookmark.versionOrderIndex)
            ]);

            if (!book || !version) {
                return null;
            }

            return {
                id: bookmark.id,
                title: bookmark.title,
                color: bookmark.color,
                reference: `${book.name} ${bookmark.chapter}:${bookmark.verse}`,
                book: buildBookPayload(book),
                verse: await buildVersePreview({
                    bookCode: book.code,
                    chapter: bookmark.chapter,
                    verse: bookmark.verse,
                    versionCode: version.code,
                    versionName: version.name
                }),
                createdAt: bookmark.createdAt,
                updatedAt: bookmark.updatedAt
            };
        }));

        const filteredBookmarks = formattedBookmarks.filter(bookmark => bookmark !== null);

        return {
            success: true,
            data: {
                bookmarks: filteredBookmarks,
                pagination: {
                    total,
                    limit,
                    offset,
                    hasMore: offset + limit < total
                }
            },
            count: filteredBookmarks.length
        };
    } catch {
        throw createError({
            statusCode: 500,
            message: 'Erreur lors de la récupération des favoris'
        });
    }
});

import { prisma } from '~~/lib/prisma';

export default defineEventHandler(async (event) => {
    try {
        // Vérifier l'authentification
        const { user: userSession } = await getUserSession(event);

        if (!userSession) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Non autorisé'
            });
        }

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
            const book = await prisma.bibleBook.findUnique({
                where: { code: bookCode.toUpperCase() }
            });
            if (book) {
                whereClause.bookId = book.id;
            }
        }

        const [bookmarks, total] = await Promise.all([
            prisma.bibleBookmark.findMany({
                where: whereClause,
                include: {
                    book: {
                        select: {
                            code: true,
                            name: true,
                            testament: true
                        }
                    },
                    verse: {
                        select: {
                            chapter: true,
                            verse: true,
                            text: true,
                            version: {
                                select: {
                                    code: true,
                                    name: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: limit,
                skip: offset
            }),
            prisma.bibleBookmark.count({ where: whereClause })
        ]);

        const formattedBookmarks = bookmarks.map(bookmark => ({
            id: bookmark.id,
            title: bookmark.title,
            color: bookmark.color,
            reference: `${bookmark.book.name} ${bookmark.verse.chapter}:${bookmark.verse.verse}`,
            book: bookmark.book,
            verse: {
                chapter: bookmark.verse.chapter,
                verse: bookmark.verse.verse,
                text: bookmark.verse.text,
                version: bookmark.verse.version
            },
            createdAt: bookmark.createdAt,
            updatedAt: bookmark.updatedAt
        }));

        return {
            success: true,
            data: {
                bookmarks: formattedBookmarks,
                pagination: {
                    total,
                    limit,
                    offset,
                    hasMore: offset + limit < total
                }
            },
            count: bookmarks.length
        };
    } catch {
        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur lors de la récupération des favoris'
        });
    }
});

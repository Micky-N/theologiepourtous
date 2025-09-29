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
        const isPrivate = query.private === 'true' ? true : query.private === 'false' ? false : undefined;
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

            // Filtrer par chapitre si spécifié
            if (query.chapter) {
                whereClause.verse = {
                    chapter: parseInt(query.chapter as string)
                };
            }
        }

        // Filtrer par privé/public
        if (isPrivate !== undefined) {
            whereClause.isPrivate = isPrivate;
        }

        const [notes, total] = await Promise.all([
            prisma.bibleNote.findMany({
                where: whereClause,
                include: {
                    book: true,
                    verse: {
                        include: {
                            version: true
                        }
                    }
                },
                orderBy: {
                    updatedAt: 'desc'
                },
                take: limit,
                skip: offset
            }),
            prisma.bibleNote.count({ where: whereClause })
        ]);

        return {
            success: true,
            data: {
                notes,
                pagination: {
                    total,
                    limit,
                    offset,
                    hasMore: offset + limit < total
                }
            },
            count: notes.length
        };
    } catch {
        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur lors de la récupération des notes'
        });
    }
});

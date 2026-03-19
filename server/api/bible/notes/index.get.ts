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
                statusMessage: 'Non autorisé'
            });
        }

        const preferences = await prisma.userPreference.findUnique({
            where: { userId: userSession.id }
        });

        const userId = userSession.id;

        const query = getQuery<{ book?: string; chapter?: string; private?: string; limit?: string; offset?: string; version?: string; }>(event);
        const bookCode = query.book as string | undefined;
        const isPrivate = query.private === 'true' ? true : query.private === 'false' ? false : undefined;
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

            if (preferences?.notesPerVersion) {
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

        // Filtrer par privé/public
        if (isPrivate !== undefined) {
            whereClause.isPrivate = isPrivate;
        }

        const [notes, total] = await Promise.all([
            prisma.bibleNote.findMany({
                where: whereClause,
                orderBy: {
                    updatedAt: 'desc'
                },
                take: limit,
                skip: offset
            }),
            prisma.bibleNote.count({ where: whereClause })
        ]);

        const formattedNotes = await Promise.all(notes.map(async (note) => {
            const [book, version] = await Promise.all([
                getBibleBookByOrderIndex(note.bookOrderIndex),
                getBibleVersionByOrderIndex(note.versionOrderIndex)
            ]);

            if (!book || !version) {
                return null;
            }

            return {
                id: note.id,
                title: note.title,
                content: note.content,
                isPrivate: note.isPrivate,
                createdAt: note.createdAt,
                updatedAt: note.updatedAt,
                book: buildBookPayload(book),
                verse: await buildVersePreview({
                    bookCode: book.code,
                    chapter: note.chapter,
                    verse: note.verse,
                    versionCode: version.code,
                    versionName: version.name
                })
            };
        }));

        const filteredNotes = formattedNotes.filter(note => note !== null);

        return {
            success: true,
            data: {
                notes: filteredNotes,
                pagination: {
                    total,
                    limit,
                    offset,
                    hasMore: offset + limit < total
                }
            },
            count: filteredNotes.length
        };
    } catch {
        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur lors de la récupération des notes'
        });
    }
});

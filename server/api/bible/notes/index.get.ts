import { BibleNote } from '~~/src/database/models/BibleNote';
import { BibleBook } from '~~/src/database/models/BibleBook';
import { BibleVersion } from '~~/src/database/models/BibleVersion';
import { UserPreference } from '~~/src/database/models/UserPreference';

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

        const preferences = await UserPreference.findOne({
            where: { userId: userSession.id },
            include: ['defaultVersion']
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
            const book = await BibleBook.findOne({
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

            if (preferences?.notesPerVersion) {
                const versionCode = (query.version as string | undefined)?.toUpperCase() || (preferences?.defaultVersion?.code || 'LSG');
                const version = await BibleVersion.findOne({
                    where: { code: versionCode }
                });
                if (version) {
                    whereClause.verse = {
                        ...whereClause.verse,
                        versionId: version.id
                    };
                }
            }
        }

        // Filtrer par privé/public
        if (isPrivate !== undefined) {
            whereClause.isPrivate = isPrivate;
        }

        const { rows: notes, count: total } = await BibleNote.findAndCountAll({
            where: whereClause,
            include: [
                'book',
                { association: 'verse', include: ['version'] }
            ],
            order: [['updatedAt', 'DESC']],
            limit,
            offset
        });

        const formattedNotes = notes.map((note) => {
            let verse = null;
            if (note.verse) {
                verse = {
                    chapter: note.verse.chapter,
                    verse: note.verse.verse,
                    text: note.verse.text,
                    version: note.verse.version
                };
            }
            return {
                id: note.id,
                title: note.title,
                content: note.content,
                isPrivate: note.isPrivate,
                reference: `${note.book?.name} ${note.verse?.chapter}:${note.verse?.verse}`,
                book: note.book,
                verse,
                createdAt: note.createdAt,
                updatedAt: note.updatedAt
            };
        });

        return {
            success: true,
            data: {
                notes: formattedNotes,
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

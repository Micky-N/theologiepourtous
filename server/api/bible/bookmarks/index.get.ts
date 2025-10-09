import { BibleBookmark } from '~~/src/database/models/BibleBookmark';
import { BibleBook } from '~~/src/database/models/BibleBook';
import { BibleVerse } from '~~/src/database/models/BibleVerse';
import { BibleVersion } from '~~/src/database/models/BibleVersion';

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

        // Sequelize : récupérer les préférences utilisateur
        // (à adapter si UserPreference est utilisé dans la session ou via une requête séparée)
        const preferences = userSession.preferences || null;

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
            const book = await BibleBook.findOne({ where: { code: bookCode.toUpperCase() } });
            if (book) {
                whereClause.bookId = book.id;
            }

            // Filtrer par chapitre si spécifié
            if (query.chapter) {
                whereClause.chapter = parseInt(query.chapter as string);
            }

            if (preferences?.bookmarksPerVersion) {
                const versionCode = (query.version as string | undefined)?.toUpperCase() || (preferences?.defaultVersion?.code || 'LSG');
                const version = await BibleVersion.findOne({ where: { code: versionCode } });
                if (version) {
                    whereClause.versionId = version.id;
                }
            }
        }

        const { rows: bookmarks, count: total } = await BibleBookmark.findAndCountAll({
            where: whereClause,
            include: [
                { model: BibleBook },
                { model: BibleVerse, include: [BibleVersion] }
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        const formattedBookmarks = bookmarks.map(bookmark => ({
            id: bookmark.id,
            title: bookmark.title,
            color: bookmark.color,
            reference: `${bookmark.book?.name} ${bookmark.verse?.chapter}:${bookmark.verse?.verse}`,
            book: bookmark.book,
            verse: bookmark.verse
                ? {
                    chapter: bookmark.verse.chapter,
                    verse: bookmark.verse.verse,
                    text: bookmark.verse.text,
                    version: bookmark.verse.version
                }
                : null,
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

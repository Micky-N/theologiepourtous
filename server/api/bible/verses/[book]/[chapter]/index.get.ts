import { BibleBook } from '~~/src/database/models/BibleBook';
import { BibleVersion } from '~~/src/database/models/BibleVersion';
import { BibleVerse } from '~~/src/database/models/BibleVerse';

export default defineEventHandler(async (event) => {
    try {
        const bookCode = getRouterParam(event, 'book');
        const chapterNum = parseInt(getRouterParam(event, 'chapter') || '1');
        const query = getQuery(event);
        const versionCode = (query.version as string) || 'LSG';

        if (!bookCode) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Code du livre requis'
            });
        }

        // Vérifier que le livre existe
        const book = await BibleBook.findOne({ where: { code: bookCode.toUpperCase() } });
        if (!book) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Livre non trouvé'
            });
        }

        // Vérifier que le chapitre existe
        if (chapterNum < 1 || chapterNum > book.chapterCount) {
            throw createError({
                statusCode: 400,
                statusMessage: `Le chapitre doit être entre 1 et ${book.chapterCount}`
            });
        }

        // Récupérer la version
        const version = await BibleVersion.findOne({ where: { code: versionCode.toUpperCase() } });
        if (!version) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Version biblique non trouvée'
            });
        }

        // Récupérer les versets du chapitre
        const verses = await BibleVerse.findAll({
            where: {
                bookId: book.id,
                versionId: version.id,
                chapter: chapterNum
            },
            order: [['verse', 'ASC']]
        });

        return {
            success: true,
            data: {
                book: {
                    code: book.code,
                    name: book.name,
                    testament: book.testament
                },
                version: {
                    code: version.code,
                    name: version.name
                },
                chapter: chapterNum,
                verses,
                navigation: {
                    previousChapter: chapterNum > 1 ? chapterNum - 1 : null,
                    nextChapter: chapterNum < book.chapterCount ? chapterNum + 1 : null,
                    totalChapters: book.chapterCount
                }
            },
            count: verses.length
        };
    } catch (error: any) {
        console.error(error);
        if (error.statusCode) {
            throw error;
        }
        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur lors de la récupération des versets'
        });
    }
});

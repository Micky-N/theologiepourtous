import { z } from 'zod';
import {
    buildBookPayload,
    buildVersionPayload,
    getBibleBookByOrderIndex,
    getBibleChapter,
    getBibleVersionByOrderIndex,
    mapChapterVerses
} from '~~/server/utils/bibleData';

// Schéma de validation pour la requête de comparaison
const compareSchema = z.object({
    bookId: z.number().int().positive(),
    chapter: z.number().int().positive(),
    verseStart: z.number().int().positive(),
    verseEnd: z.number().int().positive().optional(),
    versions: z.array(z.number().int().positive()).min(2).max(6) // Au moins 2, max 6 versions
});

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);

        // Validation des données
        const validation = compareSchema.safeParse(body);
        if (!validation.success) {
            throw createError({
                statusCode: 400,
                message: 'Données invalides',
                data: validation.error.issues
            });
        }

        const { bookId, chapter, verseStart, verseEnd, versions } = validation.data;
        const endVerse = verseEnd || verseStart;

        const book = await getBibleBookByOrderIndex(bookId);

        if (!book) {
            throw createError({
                statusCode: 404,
                message: 'Livre non trouvé'
            });
        }

        if (chapter > book.chapterCount) {
            throw createError({
                statusCode: 400,
                message: `Le chapitre doit être entre 1 et ${book.chapterCount}`
            });
        }

        const versionRecords = (await Promise.all(versions.map(versionId => getBibleVersionByOrderIndex(versionId))))
            .filter(version => version !== null);

        if (versionRecords.length !== versions.length) {
            throw createError({
                statusCode: 404,
                message: 'Une ou plusieurs versions non trouvées'
            });
        }

        const chapterData = await getBibleChapter(book.code, chapter);

        if (!chapterData) {
            throw createError({
                statusCode: 404,
                message: 'Chapitre non trouvé'
            });
        }

        const comparisons = versionRecords.map(version => ({
            version: buildVersionPayload(version),
            verses: mapChapterVerses(chapterData, book, version)
                .filter(verse => verse.verse >= verseStart && verse.verse <= endVerse)
        }));

        return {
            success: true,
            data: {
                book: buildBookPayload(book),
                chapter,
                verseRange: {
                    start: verseStart,
                    end: endVerse
                },
                comparisons
            }
        };
    } catch (error: any) {
        console.error('Erreur lors de la comparaison:', error);

        if (error.statusCode) {
            throw error;
        }

        throw createError({
            statusCode: 500,
            message: 'Erreur interne du serveur'
        });
    }
});

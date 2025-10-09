import { BibleBookmark } from '~~/src/database/models/BibleBookmark';
import { BibleVerse } from '~~/src/database/models/BibleVerse';
import { BibleBook } from '~~/src/database/models/BibleBook';
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

        const userId = userSession.id;

        const body = await readBody(event);
        const { verseId, title, color } = body;

        if (!verseId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'ID du verset requis'
            });
        }

        // Vérifier que le verset existe
        const verse = await BibleVerse.findOne({
            where: { id: verseId },
            include: [BibleBook, BibleVersion]
        });

        if (!verse) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Verset non trouvé'
            });
        }

        // Vérifier si un bookmark existe déjà pour ce verset
        const existingBookmark = await BibleBookmark.findOne({
            where: {
                userId,
                verseId
            }
        });

        if (existingBookmark) {
            throw createError({
                statusCode: 409,
                statusMessage: 'Ce verset est déjà dans vos favoris'
            });
        }

        // Créer le nouveau bookmark
        const bookmark = await BibleBookmark.create({
            userId,
            bookId: verse.bookId,
            verseId,
            title: title || null,
            color: color || 'blue'
        });

        // Récupérer le bookmark avec les relations pour la réponse
        const fullBookmark = await BibleBookmark.findOne({
            where: { id: bookmark.id },
            include: [BibleBook, BibleVerse]
        });

        if (!fullBookmark) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Erreur lors de la récupération du favori créé'
            });
        }

        const formattedBookmark = {
            id: fullBookmark.id,
            title: fullBookmark.title,
            color: fullBookmark.color,
            reference: `${fullBookmark.book?.name} ${fullBookmark.verse?.chapter}:${fullBookmark.verse?.verse}`,
            book: fullBookmark.book,
            verse: fullBookmark.verse
                ? {
                    chapter: fullBookmark.verse.chapter,
                    verse: fullBookmark.verse.verse,
                    text: fullBookmark.verse.text,
                    version: fullBookmark.verse.version
                }
                : null,
            createdAt: fullBookmark.createdAt,
            updatedAt: fullBookmark.updatedAt
        };

        return {
            success: true,
            message: 'Favori ajouté avec succès',
            data: formattedBookmark
        };
    } catch (error: any) {
        if (error.statusCode) {
            throw error;
        }
        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur lors de la création du favori'
        });
    }
});

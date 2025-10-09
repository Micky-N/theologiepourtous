import { BibleNote } from '~~/src/database/models/BibleNote';
import { BibleBook } from '~~/src/database/models/BibleBook';
import { BibleVerse } from '~~/src/database/models/BibleVerse';

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
        const { verseId, title, content, isPrivate } = body;

        if (!verseId || !content) {
            throw createError({
                statusCode: 400,
                statusMessage: 'ID du verset et contenu requis'
            });
        }

        // Vérifier que le verset existe
        const verse = await BibleVerse.findOne({
            where: { id: verseId },
            include: [BibleBook]
        });

        if (!verse) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Verset non trouvé'
            });
        }

        // Créer la note
        const note = await BibleNote.create({
            userId,
            verseId,
            bookId: verse.bookId,
            title: title || null,
            content,
            isPrivate: isPrivate !== false // par défaut true
        });
            // Récupérer la note avec relations
        const fullNote = await BibleNote.findOne({
            where: { id: note.id },
            include: [
                { model: BibleBook },
                { model: BibleVerse }
            ]
        });

        if (!fullNote) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Erreur lors de la récupération de la note créée'
            });
        }

        return {
            success: true,
            message: 'Note créée avec succès',
            note: {
                ...fullNote.toJSON(),
                book: fullNote.book,
                verse: fullNote.verse
            }
        };
    } catch (error: any) {
        console.error('Erreur lors de la création de la note:', error);

        if (error.statusCode) {
            throw error;
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur interne du serveur'
        });
    }
});

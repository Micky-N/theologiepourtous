import { prisma } from '~~/lib/prisma';
import { buildBookPayload, buildVersePreview, resolveSyntheticVerseReference } from '~~/server/utils/bibleData';

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

        const syntheticReference = await resolveSyntheticVerseReference(verseId);

        if (!syntheticReference) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Verset non trouvé'
            });
        }

        // Créer la note
        const note = await prisma.bibleNote.create({
            data: {
                userId,
                bookOrderIndex: syntheticReference.book.orderIndex,
                versionOrderIndex: syntheticReference.version.orderIndex,
                chapter: syntheticReference.chapter,
                verse: syntheticReference.verse,
                title: title || null,
                content,
                isPrivate: isPrivate !== false // par défaut true
            }
        });

        const verse = await buildVersePreview({
            bookCode: syntheticReference.book.code,
            chapter: note.chapter,
            verse: note.verse,
            versionCode: syntheticReference.version.code,
            versionName: syntheticReference.version.name
        });

        return {
            success: true,
            message: 'Note créée avec succès',
            note: {
                id: note.id,
                title: note.title,
                content: note.content,
                isPrivate: note.isPrivate,
                createdAt: note.createdAt,
                updatedAt: note.updatedAt,
                book: buildBookPayload(syntheticReference.book),
                verse
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
    } finally {
        await prisma.$disconnect();
    }
});

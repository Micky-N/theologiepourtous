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
        const { verseId, title, color } = body;

        if (!verseId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'ID du verset requis'
            });
        }

        const syntheticReference = await resolveSyntheticVerseReference(verseId);

        if (!syntheticReference) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Verset non trouvé'
            });
        }

        // Vérifier si un bookmark existe déjà pour ce verset
        const existingBookmark = await prisma.bibleBookmark.findFirst({
            where: {
                userId,
                bookOrderIndex: syntheticReference.book.orderIndex,
                versionOrderIndex: syntheticReference.version.orderIndex,
                chapter: syntheticReference.chapter,
                verse: syntheticReference.verse
            }
        });

        if (existingBookmark) {
            throw createError({
                statusCode: 409,
                statusMessage: 'Ce verset est déjà dans vos favoris'
            });
        }

        // Créer le nouveau bookmark
        const bookmark = await prisma.bibleBookmark.create({
            data: {
                userId,
                bookOrderIndex: syntheticReference.book.orderIndex,
                versionOrderIndex: syntheticReference.version.orderIndex,
                chapter: syntheticReference.chapter,
                verse: syntheticReference.verse,
                title: title || null,
                color: color || 'blue'
            }
        });

        const verse = await buildVersePreview({
            bookCode: syntheticReference.book.code,
            chapter: bookmark.chapter,
            verse: bookmark.verse,
            versionCode: syntheticReference.version.code,
            versionName: syntheticReference.version.name
        });

        const formattedBookmark = {
            id: bookmark.id,
            title: bookmark.title,
            color: bookmark.color,
            reference: `${syntheticReference.book.name} ${bookmark.chapter}:${bookmark.verse}`,
            book: buildBookPayload(syntheticReference.book),
            verse,
            createdAt: bookmark.createdAt,
            updatedAt: bookmark.updatedAt
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

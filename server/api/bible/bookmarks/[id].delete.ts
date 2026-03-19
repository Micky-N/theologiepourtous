import { prisma } from '~~/lib/prisma';

export default defineEventHandler(async (event) => {
    try {
        // Vérifier l'authentification
        const { user: userSession } = await getUserSession(event);

        if (!userSession) {
            throw createError({
                statusCode: 401,
                message: 'Non autorisé'
            });
        }

        const userId = userSession.id;

        const bookmarkId = parseInt(getRouterParam(event, 'id') || '0');

        if (!bookmarkId) {
            throw createError({
                statusCode: 400,
                message: 'ID du favori requis'
            });
        }

        // Vérifier que le bookmark existe et appartient à l'utilisateur
        const bookmark = await prisma.bibleBookmark.findFirst({
            where: {
                id: bookmarkId,
                userId
            }
        });

        if (!bookmark) {
            throw createError({
                statusCode: 404,
                message: 'Favori non trouvé'
            });
        }

        // Supprimer le bookmark
        await prisma.bibleBookmark.delete({
            where: { id: bookmarkId }
        });

        return {
            success: true,
            message: 'Favori supprimé avec succès'
        };
    } catch (error: any) {
        if (error.statusCode) {
            throw error;
        }
        throw createError({
            statusCode: 500,
            message: 'Erreur lors de la suppression du favori'
        });
    }
});

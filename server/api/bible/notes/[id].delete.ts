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

        const noteId = parseInt(getRouterParam(event, 'id') || '0');

        if (!noteId) {
            throw createError({
                statusCode: 400,
                message: 'ID de la note requis'
            });
        }

        // Vérifier que la note existe et appartient à l'utilisateur
        const note = await prisma.bibleNote.findFirst({
            where: {
                id: noteId,
                userId
            }
        });

        if (!note) {
            throw createError({
                statusCode: 404,
                message: 'Note non trouvée'
            });
        }

        // Supprimer la note
        await prisma.bibleNote.delete({
            where: { id: noteId }
        });

        return {
            success: true,
            message: 'Note supprimée avec succès'
        };
    } catch (error: any) {
        if (error.statusCode) {
            throw error;
        }
        throw createError({
            statusCode: 500,
            message: 'Erreur lors de la suppression de la note'
        });
    }
});

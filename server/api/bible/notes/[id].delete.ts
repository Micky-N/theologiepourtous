import { requireAuth } from '../../../utils/auth'
import { prisma } from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
    try {
        // Vérifier l'authentification
        const userId = await requireAuth(event)

        const noteId = parseInt(getRouterParam(event, 'id') || '0')

        if (!noteId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'ID de la note requis'
            })
        }

        // Vérifier que la note existe et appartient à l'utilisateur
        const note = await prisma.bibleNote.findFirst({
            where: {
                id: noteId,
                userId
            }
        })

        if (!note) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Note non trouvée'
            })
        }

        // Supprimer la note
        await prisma.bibleNote.delete({
            where: { id: noteId }
        })

        return {
            success: true,
            message: 'Note supprimée avec succès'
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }
        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur lors de la suppression de la note'
        })
    }
})

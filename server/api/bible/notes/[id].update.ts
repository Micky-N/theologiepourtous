import { prisma } from '~~/lib/prisma';

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

        // Récupérer l'id de la note
        const noteId = parseInt(getRouterParam(event, 'id') || '0');
        if (!noteId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'ID de la note requis'
            });
        }

        // Récupérer le body
        const body = await readBody(event);
        const { title, content, isPrivate } = body;

        // Vérifier que la note existe et appartient à l'utilisateur
        const note = await prisma.bibleNote.findUnique({
            where: { id: Number(noteId) }
        });
        if (!note || note.userId !== userId) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Note non trouvée ou accès refusé'
            });
        }

        // Mettre à jour la note
        const updatedNote = await prisma.bibleNote.update({
            where: { id: Number(noteId) },
            data: {
                title: title ?? note.title,
                content: content ?? note.content,
                isPrivate: typeof isPrivate === 'boolean' ? isPrivate : note.isPrivate
            },
            include: {
                book: { select: { id: true, name: true } },
                verse: { select: { id: true, chapter: true, verse: true, text: true } }
            }
        });

        return {
            success: true,
            message: 'Note modifiée avec succès',
            note: updatedNote
        };
    } catch (error: any) {
        console.error('Erreur lors de la modification de la note:', error);
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

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

        const body = await readBody(event);
        const { defaultVersionId, showVerseNumbers } = body;

        // Vérifier que la version existe si fournie
        if (defaultVersionId) {
            const version = await prisma.bibleVersion.findUnique({
                where: { id: defaultVersionId }
            });

            if (!version) {
                throw createError({
                    statusCode: 404,
                    statusMessage: 'Version biblique non trouvée'
                });
            }
        }

        // Mettre à jour ou créer les préférences
        const preferences = await prisma.userBiblePreference.upsert({
            where: { userId: userSession.id },
            update: {
                ...(defaultVersionId && { defaultVersionId }),
                ...(showVerseNumbers !== undefined && { showVerseNumbers: Boolean(showVerseNumbers) })
            },
            create: {
                userId: userSession.id,
                defaultVersionId: defaultVersionId || (await prisma.bibleVersion.findFirst({
                    where: { code: 'LSG' }
                }))?.id || 1,
                showVerseNumbers: showVerseNumbers !== undefined ? Boolean(showVerseNumbers) : true
            },
            include: {
                defaultVersion: {
                    select: {
                        id: true,
                        code: true,
                        name: true
                    }
                }
            }
        });

        return {
            success: true,
            message: 'Préférences mises à jour avec succès',
            data: {
                defaultVersion: preferences.defaultVersion,
                showVerseNumbers: preferences.showVerseNumbers,
                createdAt: preferences.createdAt,
                updatedAt: preferences.updatedAt
            }
        };
    } catch (error: any) {
        if (error.statusCode) {
            throw error;
        }
        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur lors de la mise à jour des préférences'
        });
    }
});

import { z } from 'zod';
import prisma from '~~/lib/prisma';

// Schéma de validation pour démarrer une session de lecture
const startSessionSchema = z.object({
    versionId: z.number().int().positive(),
    deviceType: z.string().optional().default('web'),
    action: z.enum(['start', 'end']),
    chaptersRead: z.string().optional()
});

// Schéma de validation pour terminer une session de lecture
const endSessionSchema = z.object({
    sessionId: z.number().int().positive(),
    action: z.enum(['start', 'end']),
    chaptersRead: z.string().optional()
});

export default defineEventHandler(async (event) => {
    // Vérifier l'authentification
    const { user: userSession } = await getUserSession(event);

    if (!userSession) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Non autorisé'
        });
    }

    const userId = userSession.id;

    if (event.node.req.method === 'POST') {
        const body = await readBody(event);

        // Démarrer une nouvelle session de lecture
        if (body.action === 'start') {
            const { versionId, deviceType } = startSessionSchema.parse(body);

            try {
                // Fermer toute session ouverte existante
                await prisma.readingSession.updateMany({
                    where: {
                        userId,
                        endTime: null
                    },
                    data: {
                        endTime: new Date(),
                        isCompleted: false
                    }
                });

                // Créer nouvelle session
                const session = await prisma.readingSession.create({
                    data: {
                        userId,
                        versionId,
                        startTime: new Date(),
                        deviceType,
                        chaptersRead: body.chaptersRead
                    }
                });

                return {
                    success: true,
                    sessionId: session.id
                };
            } catch (error) {
                console.error('Erreur création session:', error);
                throw createError({
                    statusCode: 500,
                    statusMessage: 'Erreur lors de la création de la session'
                });
            }
        }

        // Terminer la session de lecture
        if (body.action === 'end') {
            const { sessionId } = endSessionSchema.parse(body);

            try {
                // Récupérer la session existante pour calculer la durée
                const existingSession = await prisma.readingSession.findUnique({
                    where: {
                        id: sessionId,
                        userId
                    }
                });

                if (!existingSession) {
                    throw createError({
                        statusCode: 404,
                        statusMessage: 'Session non trouvée'
                    });
                }

                const endTime = new Date();
                const duration = Math.round((endTime.getTime() - existingSession.startTime.getTime()) / 60000); // Durée en minutes

                await prisma.readingSession.update({
                    where: {
                        id: sessionId,
                        userId
                    },
                    data: {
                        endTime,
                        isCompleted: true,
                        duration,
                        chaptersRead: body.chaptersRead ?? existingSession.chaptersRead
                    }
                });

                return { success: true };
            } catch (error) {
                console.error('Erreur fin session:', error);
                throw createError({
                    statusCode: 500,
                    statusMessage: 'Erreur lors de la fermeture de la session'
                });
            }
        }
    }

    throw createError({
        statusCode: 400,
        statusMessage: 'Action non supportée'
    });
});

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

        const preferences = await prisma.userPreference.findUnique({
            where: { userId },
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

        if (!preferences) {
            // Créer des préférences par défaut si elles n'existent pas
            const defaultVersion = await prisma.bibleVersion.findFirst({
                where: { code: 'LSG' },
                select: { id: true }
            });

            if (!defaultVersion) {
                throw createError({
                    statusCode: 500,
                    statusMessage: 'Aucune version biblique disponible'
                });
            }

            const newPreferences = await prisma.userPreference.create({
                data: {
                    userId,
                    defaultVersionId: defaultVersion.id
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
                data: {
                    ...newPreferences,
                    defaultVersion: newPreferences.defaultVersion
                }
            };
        }

        return {
            success: true,
            data: {
                ...preferences,
                defaultVersion: preferences.defaultVersion
            }
        };
    } catch (error: any) {
        if (error.statusCode) {
            throw error;
        }
        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur lors de la récupération des préférences'
        });
    }
});

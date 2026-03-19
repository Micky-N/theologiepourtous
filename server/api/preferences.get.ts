import { prisma } from '~~/lib/prisma';
import { buildVersionPayload, getDefaultBibleVersion, getBibleVersionByOrderIndex } from '~~/server/utils/bibleData';

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
            where: { userId }
        });

        if (!preferences) {
            const defaultVersion = await getDefaultBibleVersion();

            if (!defaultVersion) {
                throw createError({
                    statusCode: 500,
                    statusMessage: 'Aucune version biblique disponible'
                });
            }

            const newPreferences = await prisma.userPreference.create({
                data: {
                    userId,
                    defaultVersionOrderIndex: defaultVersion.orderIndex
                }
            });

            return {
                success: true,
                data: {
                    ...newPreferences,
                    defaultVersion: buildVersionPayload(defaultVersion)
                }
            };
        }

        const defaultVersion = preferences.defaultVersionOrderIndex
            ? await getBibleVersionByOrderIndex(preferences.defaultVersionOrderIndex)
            : await getDefaultBibleVersion();

        return {
            success: true,
            data: {
                ...preferences,
                defaultVersion: defaultVersion ? buildVersionPayload(defaultVersion) : null
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

import { UserPreference } from '~~/src/database/models/UserPreference';
import { BibleVersion } from '~~/src/database/models/BibleVersion';

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

        const preferences = await UserPreference.findOne({
            where: { userId },
            include: [
                { model: BibleVersion, as: 'defaultVersion' }
            ]
        });

        if (!preferences) {
            // Créer des préférences par défaut si elles n'existent pas
            const defaultVersion = await BibleVersion.findOne({
                where: { code: 'LSG' }
            });

            if (!defaultVersion) {
                throw createError({
                    statusCode: 500,
                    statusMessage: 'Aucune version biblique disponible'
                });
            }

            const newPreferencesWithVersion = await UserPreference.findOne({
                where: { userId },
                include: [
                    { model: BibleVersion, as: 'defaultVersion' }
                ]
            });

            return {
                success: true,
                data: {
                    ...newPreferencesWithVersion?.toJSON(),
                    defaultVersion: newPreferencesWithVersion?.defaultVersion
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

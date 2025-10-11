import z from 'zod';
import { UserPreference } from '~~/src/database/models/UserPreference';
import { BibleVersion } from '~~/src/database/models/BibleVersion';

const preferencesSchema = z.object({
    defaultVersionId: z.number().nullable(),
    notesPerVersion: z.boolean(),
    bookmarksPerVersion: z.boolean()
});

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

        const { defaultVersionId, notesPerVersion, bookmarksPerVersion } = await readValidatedBody(event, preferencesSchema.parse);

        // Vérifier que la version existe si fournie
        let version = null;
        if (defaultVersionId) {
            version = await BibleVersion.findByPk(defaultVersionId);
            if (!version) {
                throw createError({
                    statusCode: 404,
                    statusMessage: 'Version biblique non trouvée'
                });
            }
        } else {
            version = await BibleVersion.findOne({ where: { code: 'LSG' } });
        }

        // Mettre à jour ou créer les préférences
        let preferences = await UserPreference.findOne({ where: { userId: userSession.id } });
        if (preferences) {
            await preferences.update({
                defaultVersionId: version?.id,
                notesPerVersion,
                bookmarksPerVersion
            });
        } else {
            preferences = await UserPreference.create({
                userId: userSession.id,
                defaultVersionId: version?.id,
                notesPerVersion,
                bookmarksPerVersion
            });
        }
        const preferencesWithVersion = await UserPreference.findOne({
            where: { userId: userSession.id },
            include: [
                { association: 'defaultVersion', attributes: ['id', 'code', 'name'] }
            ]
        });

        await replaceUserSession(event, {
            user: {
                id: userSession.id,
                name: userSession.name,
                email: userSession.email,
                role: userSession.role,
                preferences: {
                    defaultVersionId: preferencesWithVersion?.defaultVersionId,
                    notesPerVersion: preferencesWithVersion?.notesPerVersion,
                    bookmarksPerVersion: preferencesWithVersion?.bookmarksPerVersion,
                    defaultVersion: preferencesWithVersion?.defaultVersion
                }
            }
        });

        return {
            success: true,
            message: 'Préférences mises à jour avec succès',
            data: {
                defaultVersion: preferencesWithVersion?.defaultVersion,
                notesPerVersion: preferencesWithVersion?.notesPerVersion,
                bookmarksPerVersion: preferencesWithVersion?.bookmarksPerVersion,
                createdAt: preferencesWithVersion?.createdAt,
                updatedAt: preferencesWithVersion?.updatedAt
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

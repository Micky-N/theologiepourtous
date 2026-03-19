import z from 'zod';
import { prisma } from '~~/lib/prisma';
import { buildVersionPayload, getDefaultBibleVersion, getBibleVersionByOrderIndex } from '~~/server/utils/bibleData';

const preferencesSchema = z.object({
    defaultVersionOrderIndex: z.number().nullable(),
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

        const { defaultVersionOrderIndex, notesPerVersion, bookmarksPerVersion } = await readValidatedBody(event, preferencesSchema.parse);

        let version = null;
        if (defaultVersionOrderIndex) {
            version = await getBibleVersionByOrderIndex(defaultVersionOrderIndex);

            if (!version) {
                throw createError({
                    statusCode: 404,
                    statusMessage: 'Version biblique non trouvée'
                });
            }
        } else {
            version = await getDefaultBibleVersion();
        }

        // Mettre à jour ou créer les préférences
        const preferences = await prisma.userPreference.upsert({
            where: { userId: userSession.id },
            update: {
                defaultVersionOrderIndex: version?.orderIndex ?? null,
                notesPerVersion,
                bookmarksPerVersion
            },
            create: {
                userId: userSession.id,
                defaultVersionOrderIndex: version?.orderIndex ?? null,
                notesPerVersion,
                bookmarksPerVersion
            }
        });

        const defaultVersion = version ? buildVersionPayload(version) : null;

        await replaceUserSession(event, {
            user: {
                id: userSession.id,
                name: userSession.name,
                email: userSession.email,
                role: userSession.role,
                preferences: {
                    defaultVersionOrderIndex: preferences.defaultVersionOrderIndex,
                    notesPerVersion: preferences.notesPerVersion,
                    bookmarksPerVersion: preferences.bookmarksPerVersion,
                    defaultVersion
                }
            }
        });

        return {
            success: true,
            message: 'Préférences mises à jour avec succès',
            data: {
                defaultVersionOrderIndex: preferences.defaultVersionOrderIndex,
                defaultVersion,
                notesPerVersion: preferences.notesPerVersion,
                bookmarksPerVersion: preferences.bookmarksPerVersion,
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

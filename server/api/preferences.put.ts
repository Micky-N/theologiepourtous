import type { BibleVersion } from '@prisma/client';
import z from 'zod';
import { prisma } from '~~/lib/prisma';

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
        let version: BibleVersion | null = null;
        if (defaultVersionId) {
            version = await prisma.bibleVersion.findUnique({
                where: { id: defaultVersionId }
            });

            if (!version) {
                throw createError({
                    statusCode: 404,
                    statusMessage: 'Version biblique non trouvée'
                });
            }
        } else {
            version = await prisma.bibleVersion.findFirst({
                where: { code: 'LSG' }
            });
        }

        // Mettre à jour ou créer les préférences
        const preferences = await prisma.userPreference.upsert({
            where: { userId: userSession.id },
            update: {
                defaultVersionId: version?.id,
                notesPerVersion,
                bookmarksPerVersion
            },
            create: {
                userId: userSession.id,
                defaultVersionId: version?.id,
                notesPerVersion,
                bookmarksPerVersion
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

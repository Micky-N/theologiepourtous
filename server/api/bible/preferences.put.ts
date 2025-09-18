import { PrismaClient } from '~/generated/prisma'
import { requireAuth } from '../../utils/auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    try {
        // Vérifier l'authentification
        const userId = await requireAuth(event)

        const body = await readBody(event)
        const { defaultVersionId, showVerseNumbers } = body

        // Vérifier que la version existe si fournie
        if (defaultVersionId) {
            const version = await prisma.bibleVersion.findUnique({
                where: { id: defaultVersionId }
            })

            if (!version) {
                throw createError({
                    statusCode: 404,
                    statusMessage: 'Version biblique non trouvée'
                })
            }
        }

        // Mettre à jour ou créer les préférences
        const preferences = await prisma.userBiblePreference.upsert({
            where: { userId },
            update: {
                ...(defaultVersionId && { defaultVersionId }),
                ...(showVerseNumbers !== undefined && { showVerseNumbers: Boolean(showVerseNumbers) })
            },
            create: {
                userId,
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
        })

        return {
            success: true,
            message: 'Préférences mises à jour avec succès',
            data: {
                defaultVersion: preferences.defaultVersion,
                showVerseNumbers: preferences.showVerseNumbers,
                createdAt: preferences.createdAt,
                updatedAt: preferences.updatedAt
            }
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }
        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur lors de la mise à jour des préférences'
        })
    }
})

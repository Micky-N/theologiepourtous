import { prisma } from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
    try {
        // Vérifier l'authentification
        const { user: userSession } = await getUserSession(event)

        if (!userSession) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Non autorisé'
            })
        }

        const userId = userSession.id

        const bookmarks = await prisma.bibleBookmark.findMany({
            where: { userId },
            include: {
                book: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                verse: {
                    include: {
                        version: {
                            select: {
                                id: true,
                                code: true,
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return {
            success: true,
            bookmarks
        }
    } catch (error: any) {
        console.error('Erreur lors de la récupération des bookmarks:', error)

        if (error.statusCode) {
            throw error
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur interne du serveur'
        })
    } finally {
        await prisma.$disconnect()
    }
})

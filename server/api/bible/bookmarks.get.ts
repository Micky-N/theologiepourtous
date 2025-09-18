import { PrismaClient } from '~/generated/prisma'
import { requireAuth } from '../../utils/auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    try {
        // Vérifier l'authentification
        const userId = await requireAuth(event)

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

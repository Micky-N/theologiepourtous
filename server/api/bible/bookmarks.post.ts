import { prisma } from '~~/lib/prisma'
import { z } from 'zod'

// Schéma de validation
const createBookmarkSchema = z.object({
    verseId: z.number().int().positive(),
    bookId: z.number().int().positive(),
    title: z.string().optional(),
    color: z.string().optional().default('blue')
})

export default defineEventHandler(async (event) => {
    if (event.node.req.method !== 'POST') {
        throw createError({
            statusCode: 405,
            statusMessage: 'Method Not Allowed'
        })
    }

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

        const { verseId, bookId, title, color } = await readValidatedBody(event, createBookmarkSchema.parse)

        // Vérifier que le verset existe
        const verse = await prisma.bibleVerse.findUnique({
            where: { id: verseId },
            include: {
                book: true
            }
        })

        if (!verse) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Verset non trouvé'
            })
        }

        if (verse.bookId !== bookId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Le verset ne correspond pas au livre spécifié'
            })
        }

        // Créer le bookmark
        const bookmark = await prisma.bibleBookmark.create({
            data: {
                userId,
                verseId,
                bookId,
                title,
                color
            },
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
            }
        })

        return {
            success: true,
            message: 'Bookmark créé avec succès',
            bookmark
        }
    } catch (error: any) {
        console.error('Erreur lors de la création du bookmark:', error)

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

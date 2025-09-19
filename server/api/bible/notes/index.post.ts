import { requireAuth } from '../../../utils/auth'
import { prisma } from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
    try {
        // Vérifier l'authentification
        const userId = await requireAuth(event)

        const body = await readBody(event)
        const { verseId, title, content, isPrivate } = body

        if (!verseId || !content) {
            throw createError({
                statusCode: 400,
                statusMessage: 'ID du verset et contenu requis'
            })
        }

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

        // Créer la note
        const note = await prisma.bibleNote.create({
            data: {
                userId,
                verseId,
                bookId: verse.bookId,
                title: title || null,
                content,
                isPrivate: isPrivate !== false // par défaut true
            },
            include: {
                book: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                verse: {
                    select: {
                        id: true,
                        chapter: true,
                        verse: true,
                        text: true
                    }
                }
            }
        })

        return {
            success: true,
            message: 'Note créée avec succès',
            note
        }
    } catch (error: any) {
        console.error('Erreur lors de la création de la note:', error)

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

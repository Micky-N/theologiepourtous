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

        const body = await readBody(event)
        const { verseId, title, color } = body

        if (!verseId) {
            throw createError({
                statusCode: 400,
                statusMessage: 'ID du verset requis'
            })
        }

        // Vérifier que le verset existe
        const verse = await prisma.bibleVerse.findUnique({
            where: { id: verseId },
            include: {
                book: true,
                version: true
            }
        })

        if (!verse) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Verset non trouvé'
            })
        }

        // Vérifier si un bookmark existe déjà pour ce verset
        const existingBookmark = await prisma.bibleBookmark.findUnique({
            where: {
                userId_verseId: {
                    userId,
                    verseId
                }
            }
        })

        if (existingBookmark) {
            throw createError({
                statusCode: 409,
                statusMessage: 'Ce verset est déjà dans vos favoris'
            })
        }

        // Créer le nouveau bookmark
        const bookmark = await prisma.bibleBookmark.create({
            data: {
                userId,
                bookId: verse.bookId,
                verseId,
                title: title || null,
                color: color || 'blue'
            },
            include: {
                book: {
                    select: {
                        code: true,
                        name: true,
                        testament: true
                    }
                },
                verse: {
                    select: {
                        chapter: true,
                        verse: true,
                        text: true,
                        version: {
                            select: {
                                code: true,
                                name: true
                            }
                        }
                    }
                }
            }
        })

        const formattedBookmark = {
            id: bookmark.id,
            title: bookmark.title,
            color: bookmark.color,
            reference: `${bookmark.book.name} ${bookmark.verse.chapter}:${bookmark.verse.verse}`,
            book: bookmark.book,
            verse: {
                chapter: bookmark.verse.chapter,
                verse: bookmark.verse.verse,
                text: bookmark.verse.text,
                version: bookmark.verse.version
            },
            createdAt: bookmark.createdAt,
            updatedAt: bookmark.updatedAt
        }

        return {
            success: true,
            message: 'Favori ajouté avec succès',
            data: formattedBookmark
        }
    } catch (error: any) {
        if (error.statusCode) {
            throw error
        }
        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur lors de la création du favori'
        })
    }
})

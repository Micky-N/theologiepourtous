import { PrismaClient } from '~/generated/prisma'
import { requireAuth } from '../../../utils/auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    try {
        // Vérifier l'authentification
        const userId = await requireAuth(event)

        const query = getQuery(event)
        const bookCode = query.book as string | undefined
        const isPrivate = query.private === 'true' ? true : query.private === 'false' ? false : undefined
        const limit = Math.min(parseInt(query.limit as string) || 50, 100)
        const offset = parseInt(query.offset as string) || 0

        const whereClause: any = {
            userId
        }

        // Filtrer par livre si spécifié
        if (bookCode) {
            const book = await prisma.bibleBook.findUnique({
                where: { code: bookCode.toUpperCase() }
            })
            if (book) {
                whereClause.bookId = book.id
            }
        }

        // Filtrer par privé/public
        if (isPrivate !== undefined) {
            whereClause.isPrivate = isPrivate
        }

        const [notes, total] = await Promise.all([
            prisma.bibleNote.findMany({
                where: whereClause,
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
                },
                orderBy: {
                    updatedAt: 'desc'
                },
                take: limit,
                skip: offset
            }),
            prisma.bibleNote.count({ where: whereClause })
        ])

        const formattedNotes = notes.map(note => ({
            id: note.id,
            title: note.title,
            content: note.content,
            isPrivate: note.isPrivate,
            reference: `${note.book.name} ${note.verse.chapter}:${note.verse.verse}`,
            book: note.book,
            verse: {
                chapter: note.verse.chapter,
                verse: note.verse.verse,
                text: note.verse.text,
                version: note.verse.version
            },
            createdAt: note.createdAt,
            updatedAt: note.updatedAt
        }))

        return {
            success: true,
            data: {
                notes: formattedNotes,
                pagination: {
                    total,
                    limit,
                    offset,
                    hasMore: offset + limit < total
                }
            },
            count: notes.length
        }
    } catch {
        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur lors de la récupération des notes'
        })
    }
})

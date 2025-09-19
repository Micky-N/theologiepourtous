import { prisma } from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event)
        const testament = query.testament as 'OLD' | 'NEW' | undefined

        const books = await prisma.bibleBook.findMany({
            where: testament ? { testament } : undefined,
            orderBy: {
                orderIndex: 'asc'
            },
            select: {
                id: true,
                code: true,
                name: true,
                testament: true,
                orderIndex: true,
                chapterCount: true
            }
        })

        // Grouper par testament pour l'UI
        const grouped = {
            old: books.filter(book => book.testament === 'OLD'),
            new: books.filter(book => book.testament === 'NEW')
        }

        return {
            success: true,
            data: {
                all: books,
                grouped
            },
            count: books.length
        }
    } catch {
        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur lors de la récupération des livres bibliques'
        })
    }
})

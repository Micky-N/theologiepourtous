import { PrismaClient } from '~/generated/prisma'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event)
        const bookCode = query.book as string
        const chapter = parseInt(query.chapter as string)
        const verseStart = parseInt(query.verse as string)
        const verseEnd = parseInt(query.verseEnd as string) || verseStart
        const versionCodes = (query.versions as string)?.split(',') || ['LSG', 'S21']

        if (!bookCode || !chapter || !verseStart) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Paramètres manquants: book, chapter, verse requis'
            })
        }

        // Récupérer le livre par code
        const book = await prisma.bibleBook.findFirst({
            where: { code: bookCode }
        })

        if (!book) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Livre non trouvé'
            })
        }

        // Récupérer les versions demandées
        const versions = await prisma.bibleVersion.findMany({
            where: {
                code: { in: versionCodes }
            },
            select: {
                id: true,
                code: true,
                name: true,
                language: true,
                description: true
            }
        })

        if (versions.length === 0) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Aucune version trouvée'
            })
        }

        // Récupérer les versets pour chaque version
        const comparisons = []

        for (const version of versions) {
            const verses = await prisma.bibleVerse.findMany({
                where: {
                    versionId: version.id,
                    bookId: book.id,
                    chapter,
                    verse: {
                        gte: verseStart,
                        lte: verseEnd
                    }
                },
                orderBy: { verse: 'asc' }
            })

            comparisons.push({
                version,
                verses
            })
        }

        return {
            success: true,
            data: {
                book,
                chapter,
                verseRange: {
                    start: verseStart,
                    end: verseEnd
                },
                comparisons
            }
        }
    } catch (error: any) {
        console.error('Erreur lors de la récupération pour comparaison:', error)

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

import { z } from 'zod'
import { prisma } from '~~/lib/prisma'

// Schéma de validation pour la requête de comparaison
const compareSchema = z.object({
    bookId: z.number().int().positive(),
    chapter: z.number().int().positive(),
    verseStart: z.number().int().positive(),
    verseEnd: z.number().int().positive().optional(),
    versions: z.array(z.number().int().positive()).min(2).max(6) // Au moins 2, max 6 versions
})

export default defineEventHandler(async (event) => {
    if (event.node.req.method !== 'POST') {
        throw createError({
            statusCode: 405,
            statusMessage: 'Method Not Allowed'
        })
    }

    try {
        const body = await readBody(event)

        // Validation des données
        const validation = compareSchema.safeParse(body)
        if (!validation.success) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Données invalides',
                data: validation.error.issues
            })
        }

        const { bookId, chapter, verseStart, verseEnd, versions } = validation.data
        const endVerse = verseEnd || verseStart

        // Vérifier que le livre existe
        const book = await prisma.bibleBook.findUnique({
            where: { id: bookId }
        })

        if (!book) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Livre non trouvé'
            })
        }

        // Vérifier que toutes les versions existent
        const versionRecords = await prisma.bibleVersion.findMany({
            where: {
                id: { in: versions }
            },
            select: {
                id: true,
                code: true,
                name: true,
                language: true
            }
        })

        if (versionRecords.length !== versions.length) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Une ou plusieurs versions non trouvées'
            })
        }

        // Récupérer les versets pour toutes les versions
        const comparisons = []

        for (const version of versionRecords) {
            const verses = await prisma.bibleVerse.findMany({
                where: {
                    versionId: version.id,
                    bookId,
                    chapter,
                    verse: {
                        gte: verseStart,
                        lte: endVerse
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
                    end: endVerse
                },
                comparisons
            }
        }
    } catch (error: any) {
        console.error('Erreur lors de la comparaison:', error)

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

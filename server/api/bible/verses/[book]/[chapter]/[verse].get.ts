import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    try {
        const { book: bookCode, chapter, verse } = getRouterParams(event);
        const query = getQuery(event);
        const versionCode = query.version as string || 'LSG'; // Version par défaut

        // Validation des paramètres
        if (!bookCode || !chapter || !verse) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Les paramètres book, chapter et verse sont requis'
            });
        }

        const chapterNum = parseInt(chapter as string);
        const verseNum = parseInt(verse as string);

        if (isNaN(chapterNum) || isNaN(verseNum)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Le chapitre et le verset doivent être des nombres valides'
            });
        }

        // Vérifier que le livre existe
        const bibleBook = await prisma.bibleBook.findUnique({
            where: { code: bookCode as string }
        });

        if (!bibleBook) {
            throw createError({
                statusCode: 404,
                statusMessage: `Livre biblique "${bookCode}" non trouvé`
            });
        }

        // Vérifier que la version existe
        const bibleVersion = await prisma.bibleVersion.findUnique({
            where: { code: versionCode }
        });

        if (!bibleVersion) {
            throw createError({
                statusCode: 404,
                statusMessage: `Version biblique "${versionCode}" non trouvée`
            });
        }

        // Récupérer le verset
        const bibleVerse = await prisma.bibleVerse.findFirst({
            where: {
                bookId: bibleBook.id,
                versionId: bibleVersion.id,
                chapter: chapterNum,
                verse: verseNum
            },
            include: {
                book: true,
                version: true
            }
        });

        if (!bibleVerse) {
            throw createError({
                statusCode: 404,
                statusMessage: `Verset ${bookCode} ${chapter}:${verse} non trouvé dans la version ${versionCode}`
            });
        }

        return {
            success: true,
            data: bibleVerse
        };
    } catch (error: any) {
        // Si c'est déjà une erreur HTTP, la relancer
        if (error.statusCode) {
            throw error;
        }

        console.error('Erreur lors de la récupération du verset:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur interne du serveur lors de la récupération du verset'
        });
    }
});

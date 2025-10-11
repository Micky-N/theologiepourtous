import { z } from 'zod';
import { BibleBook } from '~~/src/database/models/BibleBook';
import { Op } from 'sequelize';
import { BibleVersion } from '~~/src/database/models/BibleVersion';
import { BibleVerse } from '~~/src/database/models/BibleVerse';

// Schéma de validation pour la requête de comparaison
const compareSchema = z.object({
    bookId: z.number().int().positive(),
    chapter: z.number().int().positive(),
    verseStart: z.number().int().positive(),
    verseEnd: z.number().int().positive().optional(),
    versions: z.array(z.number().int().positive()).min(2).max(6) // Au moins 2, max 6 versions
});

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);

        // Validation des données
        const validation = compareSchema.safeParse(body);
        if (!validation.success) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Données invalides',
                data: validation.error.issues
            });
        }

        const { bookId, chapter, verseStart, verseEnd, versions } = validation.data;
        const endVerse = verseEnd || verseStart;

        // Vérifier que le livre existe
        const book = await BibleBook.findOne({ where: { id: bookId } });

        if (!book) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Livre non trouvé'
            });
        }

        // Vérifier que toutes les versions existent
        const versionRecords = await BibleVersion.findAll({
            where: { id: versions },
            attributes: ['id', 'code', 'name', 'language']
        });

        if (versionRecords.length !== versions.length) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Une ou plusieurs versions non trouvées'
            });
        }

        // Récupérer les versets pour toutes les versions
        const comparisons = [];
        for (const version of versionRecords) {
            const verses = await BibleVerse.findAll({
                where: {
                    versionId: version.id,
                    bookId,
                    chapter,
                    verse: {
                        [Op.gte]: verseStart,
                        [Op.lte]: endVerse
                    }
                },
                order: [['verse', 'ASC']]
            });
            comparisons.push({
                version,
                verses
            });
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
        };
    } catch (error: any) {
        console.error('Erreur lors de la comparaison:', error);

        if (error.statusCode) {
            throw error;
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur interne du serveur'
        });
    }
});

import { BibleBook } from '~~/src/database/models/BibleBook';
import { BibleVersion } from '~~/src/database/models/BibleVersion';
import { BibleVerse } from '~~/src/database/models/BibleVerse';

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event);
        const searchTerm = query.q as string;
        const versionCode = (query.version as string) || 'LSG';
        const bookCode = query.book as string | undefined;
        const testament = query.testament as 'OLD' | 'NEW' | undefined;
        const limit = Math.min(parseInt(query.limit as string) || 50, 100);
        const offset = parseInt(query.offset as string) || 0;

        if (!searchTerm || searchTerm.trim().length < 3) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Le terme de recherche doit contenir au moins 3 caractères'
            });
        }

        // Récupérer la version
        const version = await BibleVersion.findOne({ where: { code: versionCode.toUpperCase() } });

        if (!version) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Version biblique non trouvée'
            });
        }

        // Construire les filtres de recherche
        const whereClause: any = {
            versionId: version.id,
            text: {
                contains: searchTerm.trim(),
                mode: 'insensitive'
            }
        };

        // Filtrer par livre si spécifié
        if (bookCode) {
            const book = await BibleBook.findOne({ where: { code: bookCode.toUpperCase() } });
            if (book) {
                whereClause.bookId = book.id;
            }
        }

        // Filtrer par testament si spécifié
        if (testament && !bookCode) {
            const booksInTestament = await BibleBook.findAll({
                where: { testament },
                attributes: ['id']
            });
            whereClause.bookId = booksInTestament.map(b => b.id);
        }

        // Rechercher les versets avec pagination
        const results = await BibleVerse.findAll({
            where: whereClause,
            include: [{
                association: 'book',
                attributes: ['code', 'name', 'testament']
            }],
            order: [
                ['book', 'orderIndex', 'ASC'],
                ['chapter', 'ASC'],
                ['verse', 'ASC']
            ],
            limit,
            offset
        });
        const total = await BibleVerse.count({ where: whereClause });

        // Formatter les résultats avec highlighting
        const formattedResults = results.map(verse => ({
            id: verse.id,
            reference: `${verse.book.name} ${verse.chapter}:${verse.verse}`,
            book: verse.book,
            chapter: verse.chapter,
            verse: verse.verse,
            text: verse.text,
            // Simplistic highlighting - dans une vraie app, utiliser une lib plus sophistiquée
            highlightedText: verse.text.replace(
                new RegExp(`(${searchTerm.trim()})`, 'gi'),
                '<mark>$1</mark>'
            )
        }));

        return {
            success: true,
            data: {
                results: formattedResults,
                searchTerm,
                version: {
                    code: version.code,
                    name: version.name
                },
                pagination: {
                    total,
                    limit,
                    offset,
                    hasMore: offset + limit < total
                }
            },
            count: results.length
        };
    } catch (error: any) {
        if (error.statusCode) {
            throw error;
        }
        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur lors de la recherche biblique'
        });
    }
});

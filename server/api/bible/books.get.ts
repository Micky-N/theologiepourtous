import { buildBookPayload, getBibleBooks } from '~~/server/utils/bibleData';

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event);
        const testament = query.testament as 'OLD' | 'NEW' | undefined;

        const books = (await getBibleBooks())
            .filter(book => !testament || book.testament === testament)
            .sort((left, right) => left.orderIndex - right.orderIndex)
            .map(buildBookPayload);

        // Grouper par testament pour l'UI
        const grouped = {
            old: books.filter(book => book.testament === 'OLD'),
            new: books.filter(book => book.testament === 'NEW')
        };

        return {
            success: true,
            data: {
                all: books,
                grouped: grouped
            },
            count: books.length
        };
    } catch {
        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur lors de la récupération des livres bibliques'
        });
    }
});

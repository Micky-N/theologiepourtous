import { BibleBook } from '~~/src/database/models/BibleBook';

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event);
        const testament = query.testament as 'OLD' | 'NEW' | undefined;

        const books = await BibleBook.findAll({
            where: testament ? { testament } : undefined,
            order: [['orderIndex', 'ASC']]
        });

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
    } catch (error) {
        console.error(error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur lors de la récupération des livres bibliques'
        });
    }
});

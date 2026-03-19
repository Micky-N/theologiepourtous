import {
    getBibleBookByCode,
    getBibleBooks,
    getBibleChapter,
    getBibleVersionByCode
} from '~~/server/utils/bibleData';

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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

        const normalizedSearchTerm = searchTerm.trim();
        const normalizedSearchTermLower = normalizedSearchTerm.toLocaleLowerCase();

        const version = await getBibleVersionByCode(versionCode);

        if (!version) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Version biblique non trouvée'
            });
        }

        let books = (await getBibleBooks())
            .sort((left, right) => left.orderIndex - right.orderIndex);

        if (bookCode) {
            const book = await getBibleBookByCode(bookCode);
            books = book ? [book] : [];
        }

        if (testament && !bookCode) {
            books = books.filter(book => book.testament === testament);
        }

        const allMatches: Array<{
            id: number;
            reference: string;
            book: {
                id: number;
                code: string;
                name: string;
                testament: 'OLD' | 'NEW';
                orderIndex: number;
                chapterCount: number;
                createdAt: string;
                updatedAt: string;
            };
            chapter: number;
            verse: number;
            text: string;
            highlightedText: string;
        }> = [];

        const highlightPattern = new RegExp(`(${escapeRegExp(normalizedSearchTerm)})`, 'gi');

        for (const book of books) {
            for (let chapterNumber = 1; chapterNumber <= book.chapterCount; chapterNumber++) {
                const chapter = await getBibleChapter(book.code, chapterNumber);

                if (!chapter) {
                    continue;
                }

                for (const verse of chapter.verses) {
                    const text = verse.texts[version.code];

                    if (typeof text !== 'string' || !text.toLocaleLowerCase().includes(normalizedSearchTermLower)) {
                        continue;
                    }

                    allMatches.push({
                        id: (book.orderIndex * 1_000_000) + (chapterNumber * 1_000) + (verse.verse * 10) + version.orderIndex,
                        reference: `${book.name} ${chapterNumber}:${verse.verse}`,
                        book: {
                            id: book.orderIndex,
                            code: book.code,
                            name: book.name,
                            testament: book.testament,
                            orderIndex: book.orderIndex,
                            chapterCount: book.chapterCount,
                            createdAt: new Date(0).toISOString(),
                            updatedAt: new Date(0).toISOString()
                        },
                        chapter: chapterNumber,
                        verse: verse.verse,
                        text,
                        highlightedText: text.replace(highlightPattern, '<mark>$1</mark>')
                    });
                }
            }
        }

        const total = allMatches.length;
        const results = allMatches.slice(offset, offset + limit);

        return {
            success: true,
            data: {
                results,
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

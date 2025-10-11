import type { BibleBook, BibleBookmark, BibleVerse, BibleVersion } from '~~/src/database/models';

interface BookmarkData extends BibleBookmark {
    book: BibleBook;
    verse: BibleVerse & { version: BibleVersion; };
}

export const useBookmarks = () => {
    const bookmarks = ref<BookmarkData[]>([]);
    const total = ref(0);

    // Récupérer les signets
    const fetchBookmarks = async (options?: {
        book?: string;
        chapter?: number;
        limit?: number;
        offset?: number;
    }) => {
        const query: Record<string, string> = {};
        if (options?.book) query.book = options.book;
        if (options?.chapter) query.chapter = options.chapter.toString();
        if (options?.limit) query.limit = options.limit.toString();
        if (options?.offset) query.offset = options.offset.toString();

        const { data } = await $fetch<{ data: { bookmarks: BookmarkData[]; pagination: { total: number; }; }; }>('/api/bible/bookmarks', {
            query
        });

        bookmarks.value = data.bookmarks;
        total.value = data.pagination.total;
        return data;
    };

    // Supprimer un signet
    const deleteBookmark = async (bookmarkId: number) => {
        await $fetch(`/api/bible/bookmarks/${bookmarkId}`, {
            method: 'DELETE'
        });

        // Retirer le signet de la liste locale
        bookmarks.value = bookmarks.value.filter(b => b.id !== bookmarkId);
        total.value = Math.max(0, total.value - 1);

        return { success: true };
    };

    // Grouper les signets par couleur pour la timeline
    const groupedByColor = computed<Record<keyof typeof colorLabels, BookmarkData[]>>(() => {
        const groups: Record<string, BookmarkData[]> = {};

        bookmarks.value.forEach((bookmark) => {
            const color = bookmark.color || 'gray';
            if (!groups[color]) {
                groups[color] = [];
            }
            groups[color].push(bookmark);
        });

        return groups;
    });

    // Couleurs disponibles (noms des couleurs Tailwind)
    const colorLabels = {
        red: 'Rouge',
        orange: 'Orange',
        amber: 'Ambre',
        yellow: 'Jaune',
        lime: 'Lime',
        green: 'Vert',
        emerald: 'Émeraude',
        teal: 'Sarcelle',
        cyan: 'Cyan',
        sky: 'Ciel',
        blue: 'Bleu',
        indigo: 'Indigo',
        violet: 'Violet',
        purple: 'Violet foncé',
        fuchsia: 'Fuchsia',
        pink: 'Rose',
        rose: 'Rose pâle',
        stone: 'Pierre',
        neutral: 'Neutre',
        zinc: 'Zinc',
        gray: 'Gris',
        slate: 'Ardoise'
    };

    return {
        bookmarks: readonly(bookmarks),
        total: readonly(total),
        groupedByColor,
        colorLabels,
        fetchBookmarks,
        deleteBookmark
    };
};

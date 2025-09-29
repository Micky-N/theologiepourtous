interface BookmarkData {
    id: number
    title: string | null
    color: string | null
    reference: string
    book: {
        code: string
        name: string
        testament: string
    }
    verse: {
        chapter: number
        verse: number
        text: string
        version: {
            code: string
            name: string
        }
    }
    createdAt: Date | string
    updatedAt: Date | string
}

export const useBookmarks = () => {
    const pending = ref(false);
    const error = ref<string | null>(null);
    const bookmarks = ref<BookmarkData[]>([]);
    const total = ref(0);

    // Récupérer les signets
    const fetchBookmarks = async (options?: {
        book?: string
        chapter?: number
        limit?: number
        offset?: number
    }) => {
        try {
            pending.value = true;
            error.value = null;

            const query: Record<string, string> = {};
            if (options?.book) query.book = options.book;
            if (options?.chapter) query.chapter = options.chapter.toString();
            if (options?.limit) query.limit = options.limit.toString();
            if (options?.offset) query.offset = options.offset.toString();

            const { data } = await $fetch('/api/bible/bookmarks', {
                query
            });

            bookmarks.value = data.bookmarks;
            total.value = data.pagination.total;

            return data;
        } catch (err: any) {
            error.value = err.data?.message || 'Erreur lors du chargement des signets';
            throw err;
        } finally {
            pending.value = false;
        }
    };

    // Supprimer un signet
    const deleteBookmark = async (bookmarkId: number) => {
        try {
            await $fetch(`/api/bible/bookmarks/${bookmarkId}`, {
                method: 'DELETE'
            });

            // Retirer le signet de la liste locale
            bookmarks.value = bookmarks.value.filter(b => b.id !== bookmarkId);
            total.value = Math.max(0, total.value - 1);

            return { success: true };
        } catch (err: any) {
            error.value = err.data?.message || 'Erreur lors de la suppression du signet';
            throw err;
        }
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
        pending: readonly(pending),
        error: readonly(error),
        bookmarks: readonly(bookmarks),
        total: readonly(total),
        groupedByColor,
        colorLabels,
        fetchBookmarks,
        deleteBookmark
    };
};

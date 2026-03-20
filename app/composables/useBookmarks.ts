import type { AuthenticatedUserData, BibleBookmarkWithVersePreview } from '~/types';
import type { BackendBibleBookmark } from '~/composables/useSanctumBibleData';

type BookmarkMetadataStore = Record<string, Record<string, { title: string | null; color: string | null; }>>;

export const useBookmarks = () => {
    const client = useSanctumClient();
    const user = useSanctumUser<AuthenticatedUserData>();
    const { mapBibleBookmark, resolveSyntheticVerseReference } = useSanctumBibleData();
    const metadataStore = useLocalStorage<BookmarkMetadataStore>('theologie-bookmark-metadata', {});
    const bookmarks = ref<BibleBookmarkWithVersePreview[]>([]);
    const total = ref(0);

    const getUserStore = () => {
        const userId = user.value?.id ?? 'guest';
        return metadataStore.value[userId] ?? {};
    };

    const setBookmarkMetadata = (bookmarkId: string, title: string | null, color: string | null) => {
        const userId = user.value?.id ?? 'guest';
        metadataStore.value = {
            ...metadataStore.value,
            [userId]: {
                ...getUserStore(),
                [bookmarkId]: {
                    title,
                    color
                }
            }
        };
    };

    const removeBookmarkMetadata = (bookmarkId: string) => {
        const userId = user.value?.id ?? 'guest';
        const userStore = getUserStore();
        const nextUserStore = Object.fromEntries(
            Object.entries(userStore).filter(([id]) => id !== bookmarkId)
        );
        metadataStore.value = {
            ...metadataStore.value,
            [userId]: nextUserStore
        };
    };

    // Récupérer les signets
    const fetchBookmarks = async (options?: {
        book?: string;
        chapter?: number;
        limit?: number;
        offset?: number;
        version?: string;
    }) => {
        const response = await client<{ data: BackendBibleBookmark[]; }>('/bible-bookmarks', {
            method: 'GET'
        });

        const filteredBookmarks = response.data.filter((bookmark) => {
            if (options?.book && bookmark.book_code.toUpperCase() !== options.book.toUpperCase()) {
                return false;
            }

            if (options?.chapter && bookmark.chapter !== options.chapter) {
                return false;
            }

            return true;
        });

        const limit = options?.limit ?? 50;
        const offset = options?.offset ?? 0;
        const paginatedBookmarks = filteredBookmarks.slice(offset, offset + limit);
        const userStore = getUserStore();
        const mappedBookmarks = await Promise.all(
            paginatedBookmarks.map(async bookmark => await mapBibleBookmark(bookmark, {
                queryVersionCode: options?.version ?? null,
                preferredVersionCode: user.value?.preferences.preferred_version ?? 'LSG',
                title: userStore[bookmark.id]?.title ?? null,
                color: userStore[bookmark.id]?.color ?? 'blue'
            }))
        );

        bookmarks.value = mappedBookmarks.filter((bookmark): bookmark is BibleBookmarkWithVersePreview => bookmark !== null);
        total.value = filteredBookmarks.length;

        return {
            bookmarks: bookmarks.value,
            pagination: {
                total: total.value,
                limit,
                offset,
                hasMore: offset + limit < filteredBookmarks.length
            }
        };
    };

    const createBookmark = async (payload: {
        verseId: number;
        title?: string;
        color?: string;
    }) => {
        const syntheticReference = await resolveSyntheticVerseReference(payload.verseId);

        if (!syntheticReference) {
            throw createError({
                statusCode: 404,
                message: 'Verset non trouvé'
            });
        }

        const response = await client<{ data: BackendBibleBookmark; }>('/bible-bookmarks', {
            method: 'POST',
            body: {
                book_code: syntheticReference.book.code,
                chapter: syntheticReference.chapter,
                verse: syntheticReference.verse
            }
        });

        setBookmarkMetadata(response.data.id, payload.title ?? null, payload.color ?? 'blue');

        const bookmark = await mapBibleBookmark(response.data, {
            preferredVersionCode: syntheticReference.version.code,
            title: payload.title ?? null,
            color: payload.color ?? 'blue'
        });

        if (!bookmark) {
            throw createError({
                statusCode: 404,
                message: 'Référence biblique introuvable'
            });
        }

        return {
            success: true,
            message: 'Favori ajouté avec succès',
            data: bookmark
        };
    };

    // Supprimer un signet
    const deleteBookmark = async (bookmarkId: string) => {
        await client(`/bible-bookmarks/${bookmarkId}`, {
            method: 'DELETE'
        });

        removeBookmarkMetadata(bookmarkId);

        // Retirer le signet de la liste locale
        bookmarks.value = bookmarks.value.filter(b => b.id !== bookmarkId);
        total.value = Math.max(0, total.value - 1);

        return { success: true };
    };

    // Grouper les signets par couleur pour la timeline
    const groupedByColor = computed<Record<keyof typeof colorLabels, BibleBookmarkWithVersePreview[]>>(() => {
        const groups: Record<string, BibleBookmarkWithVersePreview[]> = {};

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
        createBookmark,
        deleteBookmark
    };
};

import type { AuthenticatedUserData, BibleNoteWithVersePreview } from '~/types';
import type { BackendBibleNote } from '~/composables/useSanctumBibleData';

type NoteListResponse = {
    notes: BibleNoteWithVersePreview[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
    };
};

type NoteMetadataStore = Record<string, Record<string, { title: string | null; }>>;

export const useBibleNotes = () => {
    const client = useSanctumClient();
    const user = useSanctumUser<AuthenticatedUserData>();
    const notes = ref<BibleNoteWithVersePreview[]>([]);
    const total = ref(0);
    const metadataStore = useLocalStorage<NoteMetadataStore>('theologie-note-metadata', {});
    const { mapBibleNote, resolveSyntheticVerseReference } = useSanctumBibleData();

    const getUserStore = () => {
        const userId = user.value?.id ?? 'guest';
        return metadataStore.value[userId] ?? {};
    };

    const setNoteMetadata = (noteId: string, title: string | null) => {
        const userId = user.value?.id ?? 'guest';
        metadataStore.value = {
            ...metadataStore.value,
            [userId]: {
                ...getUserStore(),
                [noteId]: {
                    title
                }
            }
        };
    };

    const removeNoteMetadata = (noteId: string) => {
        const userId = user.value?.id ?? 'guest';
        const userStore = getUserStore();
        const nextUserStore = Object.fromEntries(
            Object.entries(userStore).filter(([id]) => id !== noteId)
        );
        metadataStore.value = {
            ...metadataStore.value,
            [userId]: nextUserStore
        };
    };

    const fetchNotes = async (options?: {
        book?: string;
        chapter?: number;
        isPrivate?: boolean;
        limit?: number;
        offset?: number;
        version?: string;
    }): Promise<NoteListResponse> => {
        const response = await client<{ data: BackendBibleNote[]; }>('/bible-notes', {
            method: 'GET',
            query: undefined
        });

        const userStore = getUserStore();
        const filteredNotes = response.data.filter((note) => {
            if (options?.book && note.book_code.toUpperCase() !== options.book.toUpperCase()) {
                return false;
            }

            if (options?.chapter && note.chapter !== options.chapter) {
                return false;
            }

            if (typeof options?.isPrivate === 'boolean' && (!note.is_public) !== options.isPrivate) {
                return false;
            }

            return true;
        });

        const limit = options?.limit ?? 50;
        const offset = options?.offset ?? 0;
        const paginatedNotes = filteredNotes.slice(offset, offset + limit);
        const mappedNotes = await Promise.all(
            paginatedNotes.map(async note => await mapBibleNote(note, {
                queryVersionCode: options?.version ?? null,
                preferredVersionCode: user.value?.preferences.preferred_version ?? 'LSG',
                title: userStore[note.id]?.title ?? null
            }))
        );

        notes.value = mappedNotes.filter((note): note is BibleNoteWithVersePreview => note !== null);
        total.value = filteredNotes.length;

        return {
            notes: notes.value,
            pagination: {
                total: total.value,
                limit,
                offset,
                hasMore: offset + limit < filteredNotes.length
            }
        };
    };

    const createNote = async (payload: {
        verseId: number;
        title?: string;
        content: string;
        isPrivate: boolean;
    }) => {
        const syntheticReference = await resolveSyntheticVerseReference(payload.verseId);

        if (!syntheticReference) {
            throw createError({
                statusCode: 404,
                message: 'Verset non trouvé'
            });
        }

        const response = await client<{ data: BackendBibleNote; }>('/bible-notes', {
            method: 'POST',
            body: {
                book_code: syntheticReference.book.code,
                chapter: syntheticReference.chapter,
                verse: syntheticReference.verse,
                text: payload.content,
                is_public: payload.isPrivate === false
            }
        });

        setNoteMetadata(response.data.id, payload.title ?? null);

        const note = await mapBibleNote(response.data, {
            preferredVersionCode: syntheticReference.version.code,
            title: payload.title ?? null
        });

        if (!note) {
            throw createError({
                statusCode: 404,
                message: 'Référence biblique introuvable'
            });
        }

        return {
            success: true,
            message: 'Note créée avec succès',
            note
        };
    };

    const updateNote = async (noteId: string, payload: {
        title?: string;
        content?: string;
        isPrivate?: boolean;
    }) => {
        const response = await client<{ data: BackendBibleNote; }>(`/bible-notes/${noteId}`, {
            method: 'PATCH',
            body: {
                text: payload.content,
                is_public: typeof payload.isPrivate === 'boolean' ? !payload.isPrivate : undefined
            }
        });

        setNoteMetadata(noteId, payload.title ?? null);

        const note = await mapBibleNote(response.data, {
            preferredVersionCode: user.value?.preferences.preferred_version ?? 'LSG',
            title: payload.title ?? null
        });

        if (!note) {
            throw createError({
                statusCode: 404,
                message: 'Référence biblique introuvable'
            });
        }

        return {
            success: true,
            message: 'Note modifiée avec succès',
            note
        };
    };

    const deleteNote = async (noteId: string) => {
        await client(`/bible-notes/${noteId}`, {
            method: 'DELETE'
        });

        removeNoteMetadata(noteId);
        notes.value = notes.value.filter(note => note.id !== noteId);
        total.value = Math.max(0, total.value - 1);

        return {
            success: true,
            message: 'Note supprimée avec succès'
        };
    };

    return {
        notes: readonly(notes),
        total: readonly(total),
        fetchNotes,
        createNote,
        updateNote,
        deleteNote
    };
};

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

export const useBibleNotes = () => {
    const client = useSanctumClient();
    const user = useSanctumUser<AuthenticatedUserData>();
    const notes = ref<BibleNoteWithVersePreview[]>([]);
    const total = ref(0);
    const { mapBibleNote, resolveSyntheticVerseReference } = useSanctumBibleData();

    const fetchNotes = async (options?: {
        book?: string;
        chapter?: number;
        isPrivate?: boolean;
        limit?: number;
        offset?: number;
        version?: string;
    }): Promise<NoteListResponse> => {
        const response = await client<BackendBibleNote[]>('/bible-notes', {
            method: 'GET',
            query: undefined
        });

        const filteredNotes = response.filter((note) => {
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
                title: note.title ?? null
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
        verseId: string;
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

        const response = await client<BackendBibleNote>('/bible-notes', {
            method: 'POST',
            body: {
                book_code: syntheticReference.book.code,
                chapter: syntheticReference.chapter,
                verse: syntheticReference.verse,
                title: payload.title ?? null,
                content: payload.content,
                is_public: payload.isPrivate === false
            }
        });

        const note = await mapBibleNote(response, {
            preferredVersionCode: syntheticReference.version.code,
            title: response.title ?? payload.title ?? null
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
        const response = await client<BackendBibleNote>(`/bible-notes/${noteId}`, {
            method: 'PATCH',
            body: {
                title: payload.title ?? null,
                content: payload.content,
                is_public: typeof payload.isPrivate === 'boolean' ? !payload.isPrivate : undefined
            }
        });

        const note = await mapBibleNote(response, {
            preferredVersionCode: user.value?.preferences.preferred_version ?? 'LSG',
            title: response.title ?? payload.title ?? null
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

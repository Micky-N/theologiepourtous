<template>
    <UMain>
        <UContainer>
            <UPage>
                <UPageHeader
                    title="Mes Notes"
                    description="Gérez vos notes personnelles sur les versets bibliques"
                >
                    <template #right>
                        <UButton
                            icon="i-heroicons-plus"
                            label="Nouvelle note"
                            @click="openCreateModal"
                        />
                    </template>
                </UPageHeader>

                <UPageBody>
                    <!-- Filtres -->
                    <div class="flex flex-col sm:flex-row gap-4 mb-6">
                        <USelectMenu
                            v-model="selectedBook"
                            :items="bookOptions"
                            label-key="label"
                            value-key="value"
                            placeholder="Tous les livres"
                            searchable
                            class="flex-1"
                            @change="fetchNotes"
                        />
                        <USelect
                            v-model="selectedPrivacy"
                            :items="privacyOptions"
                            label-key="label"
                            value-key="value"
                            placeholder="Toutes les notes"
                            class="flex-1 sm:flex-none"
                            @change="fetchNotes"
                        />
                        <UInput
                            v-model="searchQuery"
                            placeholder="Rechercher dans les notes..."
                            icon="i-heroicons-magnifying-glass"
                            class="flex-1"
                            @input="debouncedSearch"
                        />
                    </div>

                    <!-- Liste des notes -->
                    <div
                        v-if="pending"
                        class="space-y-4"
                    >
                        <USkeleton
                            v-for="i in 3"
                            :key="i"
                            class="h-32 w-full"
                        />
                    </div>

                    <div
                        v-else-if="notes.length === 0"
                        class="text-center py-12"
                    >
                        <UIcon
                            name="i-heroicons-document-text"
                            class="w-12 h-12 text-gray-400 mx-auto mb-4"
                        />
                        <p class="text-gray-500 text-lg mb-4">
                            Aucune note trouvée
                        </p>
                        <UButton
                            to="/bible"
                            icon="i-lucide-book-open-text"
                            label="Lire la Bible"
                        />
                    </div>

                    <div
                        v-else
                        class="space-y-4"
                    >
                        <UCard
                            v-for="note in notes"
                            :key="note.id"
                            class="hover:shadow-lg transition-shadow cursor-pointer"
                            @click="openViewModal(note)"
                        >
                            <template #header>
                                <div class="flex items-center justify-between">
                                    <div class="flex-1">
                                        <h3 class="font-semibold text-lg text-gray-900 dark:text-white">
                                            {{ note.title || 'Note sans titre' }}
                                        </h3>
                                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {{ note.book.name }} {{ note.verse.chapter }}:{{ note.verse.verse }}
                                            ({{ note.verse.version.code }})
                                        </p>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <UBadge
                                            :color="note.isPrivate ? 'error' : 'success'"
                                            size="xs"
                                        >
                                            {{ note.isPrivate ? 'Privée' : 'Publique' }}
                                        </UBadge>
                                        <UDropdownMenu :items="getDropdownItems(note)">
                                            <UButton
                                                icon="i-heroicons-ellipsis-vertical"
                                                variant="ghost"
                                                size="sm"
                                                @click.stop
                                            />
                                        </UDropdownMenu>
                                    </div>
                                </div>
                            </template>

                            <div class="space-y-3">
                                <!-- Verset -->
                                <blockquote class="border-l-4 border-primary-500 pl-4 italic text-gray-700 dark:text-gray-300">
                                    "{{ truncateText(note.verse.text, 150) }}"
                                </blockquote>

                                <!-- Contenu de la note -->
                                <div class="prose prose-sm dark:prose-invert max-w-none">
                                    {{ truncateText(note.content, 200) }}
                                </div>

                                <!-- Métadonnées -->
                                <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                    <span>Créée le {{ formatDate(note.createdAt) }}</span>
                                    <span v-if="note.updatedAt !== note.createdAt">
                                        Modifiée le {{ formatDate(note.updatedAt) }}
                                    </span>
                                </div>
                            </div>
                        </UCard>
                    </div>

                    <!-- Pagination -->
                    <div
                        v-if="totalPages > 1"
                        class="flex justify-center mt-8"
                    >
                        <UPagination
                            v-model="currentPage"
                            :page-count="pageSize"
                            :total="totalNotes"
                            @update:model-value="fetchNotes"
                        />
                    </div>
                </UPageBody>
            </UPage>
        </UContainer>
        <NoteShowDrawer
            v-if="selectedNote"
            v-model:open="showViewModal"
            :notes="[selectedNote]"
            :verse="selectedNote.verse"
            :book="selectedNote.book"
            :footer="false"
            @edit="openEditModal"
            @delete="deleteNote"
        />
        <NoteCreateDrawer
            v-if="editingNote"
            v-model:open="showCreateModal"
            :note="editingNote"
            :verse="editingNote.verse"
            :book="editingNote.book"
            @close="closeCreateModal"
            @refresh-note="fetchNotes"
        />

        <!-- Modal confirmation suppression -->
        <UModal
            v-model:open="showDeleteModal"
            title="Supprimer la note"
        >
            <template #body>
                <p class="text-gray-600 dark:text-gray-400">
                    Êtes-vous sûr de vouloir supprimer cette note ? Cette action est irréversible.
                </p>
            </template>
            <template #footer>
                <div class="flex gap-3 justify-end">
                    <UButton
                        color="neutral"
                        variant="soft"
                        @click="showDeleteModal = false"
                    >
                        Annuler
                    </UButton>
                    <UButton
                        color="error"
                        :loading="deleteModalLoading"
                        @click="confirmDeleteNote"
                    >
                        Supprimer
                    </UButton>
                </div>
            </template>
        </UModal>
    </UMain>
</template>

<script lang="ts" setup>
import type { BibleBook, BibleNote, BibleVerse, BibleVersion } from '~~/src/database/models';

definePageMeta({
    middleware: 'auth'
});

useHead({
    title: 'Mes Notes',
    meta: [
        { name: 'description', content: 'Gérez vos notes personnelles sur les versets bibliques' },
        { name: 'robots', content: 'noindex,nofollow' }
    ]
});

// Types
interface Note extends BibleNote {
    book: BibleBook;
    verse: BibleVerse & { version: BibleVersion; };
}

interface Verse extends BibleVerse {
    id: number;
    chapter: number;
    verse: number;
    text: string;
    book: {
        name: string;
        code: string;
    };
    version: {
        code: string;
        name: string;
    };
}

// État réactif
const notes = ref<Note[]>([]);
const pending = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const totalNotes = ref(0);
const totalPages = computed(() => Math.ceil(totalNotes.value / pageSize.value));

// Filtres
const selectedBook = ref<string>('');
const selectedPrivacy = ref<string | null>(null);
const searchQuery = ref('');

// Modals
const showCreateModal = ref(false);
const showViewModal = ref(false);
const showDeleteModal = ref(false);
const selectedNote = ref<Note | null>(null);
const editingNote = ref<Note | null>(null);
const deleteModalLoading = ref(false);
const noteToDelete = ref<Note | null>(null);

// Options
const bookOptions = ref<{ label: string; value: string | null; }[]>([]);
const privacyOptions = [
    { label: 'Toutes les notes', value: null },
    { label: 'Notes privées', value: 'true' },
    { label: 'Notes publiques', value: 'false' }
];
const verseOptions = ref<{ label: string; value: number; }[]>([]);
const selectedVerse = ref<number | undefined>(undefined);

const noteForm = ref({
    title: '',
    content: '',
    verseId: undefined as number | undefined,
    isPrivate: false
});

// Fonctions utilitaires
const truncateText = (text: string, length: number): string => {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
};

const formatDate = (dateString: string | Date): string => {
    if (typeof dateString === 'string') {
        dateString = new Date(dateString);
    }
    return dateString.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const debouncedSearch = useDebounceFn(async () => {
    await fetchNotes();
    if (searchQuery.value.trim() === '' || searchQuery.value.length <= 3) return; // Si la recherche est vide ou moins de 3 caractères, ne rien faire de plus
    currentPage.value = 1;
    const filteredNotes = [];
    for (const note of notes.value) {
        if (note.title?.toLowerCase().includes(searchQuery.value.toLowerCase())) {
            // Si la note correspond à la recherche, l'ajouter à la liste des résultats
            filteredNotes.push(note);
        } else if (note.content.toLowerCase().includes(searchQuery.value.toLowerCase())) {
            // Si le contenu de la note correspond à la recherche, l'ajouter aussi
            filteredNotes.push(note);
        }
    }
    notes.value = filteredNotes;
}, 500);

// Fonctions CRUD
const fetchNotes = async () => {
    pending.value = true;
    try {
        const params = new URLSearchParams();
        params.append('limit', pageSize.value.toString());
        params.append('offset', ((currentPage.value - 1) * pageSize.value).toString());

        if (selectedBook.value) {
            params.append('book', selectedBook.value);
        }
        if (selectedPrivacy.value !== null) {
            params.append('private', selectedPrivacy.value);
        }

        const response = await $fetch<{
            success: boolean;
            data: {
                notes: Note[];
                pagination: {
                    total: number;
                    limit: number;
                    offset: number;
                    hasMore: boolean;
                };
            };
        }>(`/api/bible/notes?${params.toString()}`);

        notes.value = response.data.notes;
        totalNotes.value = response.data.pagination.total;
    } catch (error) {
        console.error('Erreur lors du chargement des notes:', error);
        useToast().add({
            title: 'Erreur',
            description: 'Impossible de charger les notes',
            color: 'error'
        });
    } finally {
        pending.value = false;
    }
};

const fetchBooks = async () => {
    try {
        const response = await $fetch<any>('/api/bible/books');

        bookOptions.value = response.data.all.map((book: any) => ({
            label: book.name,
            value: book.code
        }));

        bookOptions.value.unshift({ label: 'Tous les livres', value: null });
    } catch (error) {
        console.error('Erreur lors du chargement des livres:', error);
    }
};

const fetchVerses = async (query: string = '') => {
    try {
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        params.append('limit', '50');

        const response = await $fetch<any>(`/api/bible/search?${params.toString()}`);
        if (response.data && response.data.verses) {
            verseOptions.value = response.data.verses.map((verse: Verse) => ({
                label: `${verse.book.name} ${verse.chapter}:${verse.verse} - ${truncateText(verse.text, 60)}`,
                value: verse.id
            }));
        }
    } catch (error) {
        console.error('Erreur lors du chargement des versets:', error);
    }
};

// Actions modals
const openCreateModal = () => {
    editingNote.value = null;
    noteForm.value = {
        title: '',
        content: '',
        verseId: undefined,
        isPrivate: false
    };
    selectedVerse.value = undefined;
    showCreateModal.value = true;
    fetchVerses();
};

const openEditModal = (note: Note) => {
    editingNote.value = note;
    noteForm.value = {
        title: note.title || '',
        content: note.content,
        verseId: undefined, // Ne pas permettre de changer le verset
        isPrivate: note.isPrivate
    };
    showViewModal.value = false;
    showCreateModal.value = true;
};

const openViewModal = (note: Note) => {
    selectedNote.value = note;
    showViewModal.value = true;
};

const closeCreateModal = () => {
    showCreateModal.value = false;
    editingNote.value = null;
    noteForm.value = {
        title: '',
        content: '',
        verseId: undefined,
        isPrivate: false
    };
    selectedVerse.value = undefined;
};

const deleteNote = (note: Note) => {
    noteToDelete.value = note;
    showDeleteModal.value = true;
};

const confirmDeleteNote = async () => {
    if (!noteToDelete.value) return;
    deleteModalLoading.value = true;
    try {
        await $fetch(`/api/bible/notes/${noteToDelete.value.id}`, {
            method: 'DELETE'
        });
        useToast().add({
            title: 'Succès',
            description: 'Note supprimée avec succès',
            color: 'success'
        });
        if (showViewModal.value) {
            showViewModal.value = false;
        }
        showDeleteModal.value = false;
        noteToDelete.value = null;
        await fetchNotes();
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        useToast().add({
            title: 'Erreur',
            description: 'Erreur lors de la suppression',
            color: 'error'
        });
    } finally {
        deleteModalLoading.value = false;
    }
};

const getDropdownItems = (note: Note) => [
    [{
        label: 'Voir',
        icon: 'i-heroicons-eye',
        onSelect: () => openViewModal(note)
    }],
    [{
        label: 'Modifier',
        icon: 'i-heroicons-pencil',
        onSelect: () => openEditModal(note)
    }],
    [{
        label: 'Supprimer',
        icon: 'i-heroicons-trash',
        onSelect: () => deleteNote(note)
    }]
];

// Initialisation
onMounted(() => {
    fetchNotes();
    fetchBooks();
});

// Watchers
watch([selectedBook, selectedPrivacy], () => {
    currentPage.value = 1;
    fetchNotes();
});

watch(selectedVerse, (newValue) => {
    if (newValue) {
        noteForm.value.verseId = newValue;
    }
});
</script>

<style scoped>
@reference '~/assets/css/main.css';
.prose {
    @apply leading-relaxed;
}
</style>

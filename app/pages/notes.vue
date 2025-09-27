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
                            icon="i-heroicons-plus"
                            label="Créer votre première note"
                            @click="openCreateModal"
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
        <!-- Modal de création/édition -->
        <UModal
            v-model:open="showCreateModal"
            :prevent-close="isSubmitting"
            :ui="{
                content: 'max-w-4xl w-full'
            }"
        >
            <template #content>
                <UCard>
                    <template #header>
                        <h3 class="text-lg font-semibold">
                            {{ editingNote ? 'Modifier la note' : 'Nouvelle note' }}
                        </h3>
                    </template>

                    <UForm
                        :state="noteForm"
                        :schema="noteSchema"
                        class="space-y-4"
                        @submit="saveNote"
                    >
                        <UFormField
                            label="Titre"
                            name="title"
                        >
                            <UInput
                                v-model="noteForm.title"
                                placeholder="Titre de la note (optionnel)"
                            />
                        </UFormField>

                        <UFormField
                            v-if="!editingNote"
                            label="Verset"
                            name="verseId"
                            required
                        >
                            <USelectMenu
                                v-model="selectedVerse"
                                :items="verseOptions"
                                label-key="label"
                                value-key="value"
                                placeholder="Sélectionner un verset..."
                                searchable
                                option-attribute="label"
                                value-attribute="value"
                            />
                        </UFormField>

                        <UFormField
                            label="Contenu"
                            name="content"
                            required
                        >
                            <UTextarea
                                v-model="noteForm.content"
                                placeholder="Écrivez votre note..."
                                :rows="6"
                            />
                        </UFormField>

                        <UFormField
                            label="Visibilité"
                            name="isPrivate"
                        >
                            <USelect
                                v-model="noteForm.isPrivate"
                                :options="[
                                    { label: 'Publique', value: false },
                                    { label: 'Privée', value: true }
                                ]"
                            />
                        </UFormField>

                        <div class="flex justify-end gap-3 pt-4">
                            <UButton
                                variant="ghost"
                                :disabled="isSubmitting"
                                @click="closeCreateModal"
                            >
                                Annuler
                            </UButton>
                            <UButton
                                type="submit"
                                :loading="isSubmitting"
                                :disabled="!noteForm.content"
                            >
                                {{ editingNote ? 'Modifier' : 'Créer' }}
                            </UButton>
                        </div>
                    </UForm>
                </UCard>
            </template>
        </UModal>

        <!-- Modal de visualisation -->
        <UModal
            v-model:open="showViewModal"
            :ui="{
                content: 'max-w-4xl w-full'
            }"
        >
            <template #content>
                <UCard v-if="selectedNote">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="text-xl font-semibold">
                                    {{ selectedNote.title || 'Note sans titre' }}
                                </h3>
                                <p class="text-sm text-gray-500 mt-1">
                                    {{ selectedNote.book.name }} {{ selectedNote.verse.chapter }}:{{ selectedNote.verse.verse }}
                                    ({{ selectedNote.verse.version.code }})
                                </p>
                            </div>
                            <div class="flex items-center gap-2">
                                <UBadge
                                    :color="selectedNote.isPrivate ? 'error' : 'success'"
                                    size="sm"
                                >
                                    {{ selectedNote.isPrivate ? 'Privée' : 'Publique' }}
                                </UBadge>
                                <UButton
                                    icon="i-heroicons-pencil"
                                    variant="ghost"
                                    size="sm"
                                    @click="openEditModal(selectedNote)"
                                />
                            </div>
                        </div>
                    </template>

                    <div class="space-y-6">
                        <!-- Verset complet -->
                        <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <blockquote class="text-lg italic text-gray-800 dark:text-gray-200 leading-relaxed">
                                "{{ selectedNote.verse.text }}"
                            </blockquote>
                            <cite class="text-sm text-gray-600 dark:text-gray-400 mt-2 block">
                                — {{ selectedNote.book.name }} {{ selectedNote.verse.chapter }}:{{ selectedNote.verse.verse }}
                            </cite>
                        </div>

                        <!-- Contenu de la note -->
                        <div class="prose dark:prose-invert max-w-none">
                            <div class="whitespace-pre-wrap">
                                {{ selectedNote.content }}
                            </div>
                        </div>

                        <!-- Métadonnées -->
                        <div class="border-t pt-4 text-sm text-gray-500 dark:text-gray-400">
                            <div class="flex justify-between">
                                <span>Créée le {{ formatDate(selectedNote.createdAt) }}</span>
                                <span v-if="selectedNote.updatedAt !== selectedNote.createdAt">
                                    Modifiée le {{ formatDate(selectedNote.updatedAt) }}
                                </span>
                            </div>
                        </div>
                    </div>
                </UCard>
            </template>
        </UModal>
    </UMain>
</template>

<script lang="ts" setup>
import { z } from 'zod';

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
interface Note {
    id: number
    title: string | null
    content: string
    isPrivate: boolean
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
    createdAt: string
    updatedAt: string
}

interface Verse {
    id: number
    chapter: number
    verse: number
    text: string
    book: {
        name: string
        code: string
    }
    version: {
        code: string
        name: string
    }
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
const selectedNote = ref<Note | null>(null);
const editingNote = ref<Note | null>(null);
const isSubmitting = ref(false);

// Options
const bookOptions = ref<{ label: string, value: string }[]>([]);
const privacyOptions = [
    { label: 'Toutes les notes', value: null },
    { label: 'Notes privées', value: 'true' },
    { label: 'Notes publiques', value: 'false' }
];
const verseOptions = ref<{ label: string, value: number }[]>([]);
const selectedVerse = ref<number | undefined>(undefined);

// Formulaire
const noteSchema = z.object({
    title: z.string().optional(),
    content: z.string().min(1, 'Le contenu est requis'),
    verseId: z.number().optional(),
    isPrivate: z.boolean()
});

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

const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
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
            success: boolean
            data: {
                notes: Note[]
                pagination: {
                    total: number
                    limit: number
                    offset: number
                    hasMore: boolean
                }
            }
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

const saveNote = async () => {
    isSubmitting.value = true;
    try {
        const payload = {
            title: noteForm.value.title || null,
            content: noteForm.value.content,
            isPrivate: noteForm.value.isPrivate,
            ...(editingNote.value ? {} : { verseId: selectedVerse.value })
        };

        if (editingNote.value) {
            await $fetch(`/api/bible/notes/${editingNote.value.id}`, {
                method: 'PUT',
                body: payload
            });
            useToast().add({
                title: 'Succès',
                description: 'Note modifiée avec succès',
                color: 'success'
            });
        } else {
            await $fetch('/api/bible/notes', {
                method: 'POST',
                body: payload
            });
            useToast().add({
                title: 'Succès',
                description: 'Note créée avec succès',
                color: 'success'
            });
        }

        closeCreateModal();
        await fetchNotes();
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        useToast().add({
            title: 'Erreur',
            description: editingNote.value ? 'Erreur lors de la modification' : 'Erreur lors de la création',
            color: 'error'
        });
    } finally {
        isSubmitting.value = false;
    }
};

const deleteNote = async (note: Note) => {
    const isConfirmed = confirm('Êtes-vous sûr de vouloir supprimer cette note ?');
    if (!isConfirmed) return;

    try {
        await $fetch(`/api/bible/notes/${note.id}`, {
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

        await fetchNotes();
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        useToast().add({
            title: 'Erreur',
            description: 'Erreur lors de la suppression',
            color: 'error'
        });
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

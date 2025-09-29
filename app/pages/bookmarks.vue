<template>
    <UMain>
        <UContainer class="py-8">
            <!-- En-tête de la page -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                    Mes Signets
                </h1>
                <p class="text-gray-600 dark:text-gray-400 mt-2">
                    Retrouvez tous vos versets favoris organisés par couleur
                </p>
            </div>

            <!-- État de chargement -->
            <div
                v-if="pending"
                class="flex justify-center items-center py-12"
            >
                <UIcon
                    name="i-heroicons-arrow-path"
                    class="animate-spin text-primary-500 text-2xl"
                />
                <span class="ml-3 text-gray-600 dark:text-gray-400">Chargement des signets...</span>
            </div>

            <!-- Erreur -->
            <UAlert
                v-else-if="error"
                :title="'Erreur'"
                :description="error"
                color="error"
                variant="soft"
                class="mb-6"
            />

            <!-- Aucun signet -->
            <div
                v-else-if="!bookmarks.length"
                class="text-center py-12"
            >
                <UIcon
                    name="i-heroicons-bookmark-slash"
                    class="text-6xl text-gray-400 mb-4"
                />
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Aucun signet trouvé
                </h3>
                <p class="text-gray-600 dark:text-gray-400 mb-6">
                    Commencez à marquer vos versets préférés lors de vos lectures
                </p>
                <UButton
                    to="/bible"
                    color="primary"
                    variant="solid"
                >
                    <UIcon
                        name="i-heroicons-book-open"
                        class="mr-2"
                    />
                    Lire la Bible
                </UButton>
            </div>

            <!-- Timeline des signets par couleur -->
            <div
                v-else
                class="space-y-8"
            >
                <!-- Statistiques -->
                <div class="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <div class="flex flex-wrap gap-4">
                        <div class="flex items-center gap-2">
                            <UIcon
                                name="i-heroicons-bookmark"
                                class="text-primary-500"
                            />
                            <span class="text-sm text-gray-600 dark:text-gray-400">Total:</span>
                            <span class="font-semibold text-gray-900 dark:text-white">{{ total }}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <UIcon
                                name="i-heroicons-swatch"
                                class="text-purple-500"
                            />
                            <span class="text-sm text-gray-600 dark:text-gray-400">Couleurs:</span>
                            <span class="font-semibold text-gray-900 dark:text-white">{{ Object.keys(groupedByColor).length }}</span>
                        </div>
                    </div>
                </div>

                <!-- Timeline par couleur -->
                <div
                    v-for="(colorBookmarks, color) in groupedByColor"
                    :key="String(color)"
                    class="space-y-4"
                >
                    <!-- En-tête de couleur -->
                    <div class="flex items-center gap-3 mb-4 ml-2.5">
                        <div
                            class="w-4 h-4 rounded-full border-2"
                            :style="{ borderColor: getColorVariable(color, 500) }"
                        />
                        <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                            {{ colorLabels[color] || color.charAt(0).toUpperCase() + color.slice(1) }}
                        </h2>
                        <UBadge
                            :color="color === 'gray' ? 'neutral' : 'primary'"
                            variant="soft"
                        >
                            {{ colorBookmarks.length }}
                        </UBadge>
                    </div>

                    <!-- Signets de cette couleur -->
                    <div class="relative">
                        <!-- Ligne verticale de la timeline -->
                        <div
                            class="absolute left-4 top-0 bottom-0 w-0.5"
                            :style="{ backgroundColor: getColorVariable(color, 200) }"
                        />

                        <!-- Éléments de la timeline -->
                        <div class="space-y-6">
                            <div
                                v-for="bookmark in colorBookmarks"
                                :key="bookmark.id"
                                class="relative flex gap-6"
                            >
                                <!-- Point de la timeline -->
                                <div class="relative flex-shrink-0 mr-2" />

                                <!-- Contenu du signet -->
                                <div class="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                                    <div class="flex justify-between items-start mb-4">
                                        <div class="flex-1">
                                            <h3 class="font-semibold text-gray-900 dark:text-white text-lg">
                                                {{ bookmark.title || bookmark.reference }}
                                            </h3>
                                            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {{ bookmark.reference }} - {{ bookmark.verse.version.name }}
                                            </p>
                                        </div>

                                        <!-- Bouton de suppression -->
                                        <UDropdownMenu :items="getDropdownItems(bookmark.id)">
                                            <UButton
                                                icon="i-heroicons-ellipsis-horizontal"
                                                size="sm"
                                                color="neutral"
                                                variant="ghost"
                                            />
                                        </UDropdownMenu>
                                    </div>

                                    <!-- Texte du verset -->
                                    <blockquote
                                        class="border-l-4 pl-4 py-2 italic text-gray-700 dark:text-gray-300 mb-4"
                                        :style="{ borderLeftColor: getColorVariable(color, 300) }"
                                    >
                                        "{{ bookmark.verse.text }}"
                                    </blockquote>

                                    <!-- Métadonnées -->
                                    <div class="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                                        <div class="flex items-center gap-1">
                                            <UIcon name="i-heroicons-book-open" />
                                            {{ bookmark.book.name }}
                                        </div>
                                        <div class="flex items-center gap-1">
                                            <UIcon name="i-heroicons-clock" />
                                            {{ formatDate(bookmark.createdAt) }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </UContainer>

        <!-- Modal de confirmation de suppression -->
        <UModal
            v-model:open="deleteModal.show"
            title="Supprimer le signet"
        >
            <template #body>
                <p class="text-gray-600 dark:text-gray-400">
                    Êtes-vous sûr de vouloir supprimer ce signet ? Cette action est irréversible.
                </p>
            </template>
            <template #footer>
                <div class="flex gap-3 justify-end">
                    <UButton
                        color="neutral"
                        variant="soft"
                        @click="deleteModal.show = false"
                    >
                        Annuler
                    </UButton>
                    <UButton
                        color="error"
                        :loading="deleteModal.loading"
                        @click="confirmDelete"
                    >
                        Supprimer
                    </UButton>
                </div>
            </template>
        </UModal>
    </UMain>
</template>

<script lang="ts" setup>
import { useBookmarks } from '~/composables/useBookmarks';

definePageMeta({
    middleware: 'auth'
});

const {
    pending,
    error,
    bookmarks,
    total,
    groupedByColor,
    colorLabels,
    fetchBookmarks,
    deleteBookmark
} = useBookmarks();

// Modal de suppression
const deleteModal = reactive({
    show: false,
    loading: false,
    bookmarkId: null as number | null
});

// Toast pour les notifications
const toast = useToast();

// Charger les signets au montage
onMounted(async () => {
    try {
        await fetchBookmarks();
    } catch (err) {
        console.error('Erreur lors du chargement des signets:', err);
    }
});

// Actions du dropdown
const getDropdownItems = (bookmarkId: number) => [
    [{
        label: 'Supprimer',
        icon: 'i-heroicons-trash',
        color: 'red',
        onSelect: () => showDeleteModal(bookmarkId)
    }]
];

// Afficher le modal de suppression
const showDeleteModal = (bookmarkId: number) => {
    deleteModal.bookmarkId = bookmarkId;
    deleteModal.show = true;
};

// Confirmer la suppression
const confirmDelete = async () => {
    if (!deleteModal.bookmarkId) return;

    try {
        deleteModal.loading = true;
        await deleteBookmark(deleteModal.bookmarkId);

        toast.add({
            title: 'Signet supprimé',
            description: 'Le signet a été supprimé avec succès',
            color: 'success'
        });

        deleteModal.show = false;
    } catch (err) {
        console.log(err);
        toast.add({
            title: 'Erreur',
            description: 'Impossible de supprimer le signet',
            color: 'error'
        });
    } finally {
        deleteModal.loading = false;
        deleteModal.bookmarkId = null;
    }
};

// Fonction pour obtenir les variables CSS de couleur
const getColorVariable = (color: string, shade: number) => {
    // Liste des couleurs Tailwind supportées
    const supportedColors = [
        'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal',
        'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink',
        'rose', 'stone', 'neutral', 'zinc', 'gray', 'slate'
    ];

    // Utiliser 'gray' par défaut si la couleur n'est pas supportée
    const validColor = supportedColors.includes(color) ? color : 'gray';

    return `var(--color-${validColor}-${shade})`;
};

// Formater les dates
const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(d);
};
</script>

<style>

</style>

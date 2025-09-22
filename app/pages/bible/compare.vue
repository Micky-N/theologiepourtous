<script setup lang="ts">
import type { BibleBook, BibleVerse, BibleVersion } from '@prisma/client';

// Types locaux simplifiés
interface SimpleComparison {
    version: BibleVersion
    verses: BibleVerse[]
}

interface ActiveComparison {
    book: BibleBook
    chapter: number
    verseRange: {
        start: number
        end: number
    }
    comparisons: SimpleComparison[]
}

definePageMeta({
    layout: 'bible'
});

useSeoMeta({
    title: 'Comparaison de versions bibliques',
    ogTitle: 'Comparaison de versions bibliques',
    description: 'Comparez différentes versions de la Bible',
    ogDescription: 'Comparez différentes versions de la Bible'
});

const route = useRoute();
const router = useRouter();

// Variables temporaires pour remplacer les composables
const availableVersions = ref<BibleVersion[]>([]);
const loadingComparison = ref(false);// Configuration de la page

// État de la page
const loadingBooks = ref(false);
const error = ref('');

// Sélection du passage
const selectedBookCode = ref<string | undefined>(undefined);
const selectedChapter = ref<number | null>(null);
const startVerse = ref<number | null>(1);
const endVerse = ref<number | null>(null);
const selectedVersions = ref<number[]>([]);

// Données
const booksOptions = ref<BibleBook[]>([]);
const activeComparison = ref<ActiveComparison | null>(null);

// Computed
const selectedBookData = computed(() =>
    booksOptions.value.find(book => book.code === selectedBookCode.value)
);

const canStartComparison = computed(() =>
    selectedBookCode.value
    && selectedChapter.value
    && startVerse.value
    && selectedVersions.value.length >= 2
    && selectedVersions.value.length <= 6
);

const availableVersionsForAdd = computed(() =>
    availableVersions.value.filter(version =>
        !activeComparison.value?.comparisons.some(comp => comp.version.id === version.id)
    )
);

const initCompare = () => {
    const verses = (route.query.verses as string | undefined || '').split('-');
    selectedBookCode.value = route.query.book as string | undefined || undefined;
    selectedChapter.value = route.query.chapter ? parseInt(route.query.chapter as string) : null;
    startVerse.value = verses.length > 0 ? parseInt(verses[0] as string) : 1;
    endVerse.value = verses.length > 1 ? parseInt(verses[1] as string) : null;

    // Pré-sélectionner des versions populaires
    if (availableVersions.value.length > 0) {
        const versions = (route.query.versions as string | undefined || 'LSG,S21').split(',');
        const defaultVersions = availableVersions.value
            .filter((v: BibleVersion) => versions.includes(v.code))
            .map((v: BibleVersion) => v.id);

        if (defaultVersions.length >= 2) {
            selectedVersions.value = defaultVersions;
        }
    }
};

// Méthodes
const toggleVersion = (versionId: number, checked: boolean | 'indeterminate') => {
    const isChecked = checked === true;
    if (isChecked) {
        if (!selectedVersions.value.includes(versionId)) {
            selectedVersions.value.push(versionId);
        }
    } else {
        selectedVersions.value = selectedVersions.value.filter(id => id !== versionId);
    }
};

const loadBooks = async () => {
    try {
        loadingBooks.value = true;
        const response = await $fetch('/api/bible/books');
        booksOptions.value = (response.data?.all) as unknown as BibleBook[];
    } catch (err) {
        error.value = 'Erreur lors du chargement des livres';
        console.error(err);
    } finally {
        loadingBooks.value = false;
    }
};

const loadVersions = async () => {
    try {
        const response = await $fetch('/api/bible/versions') as any;
        availableVersions.value = response.data || response;
    } catch (err) {
        error.value = 'Erreur lors du chargement des versions';
        console.error(err);
    }
};

const startComparison = async () => {
    if (!canStartComparison.value) return;

    try {
        error.value = '';
        loadingComparison.value = true;

        const book = selectedBookData.value;
        const chapter = selectedChapter.value!;
        const start = startVerse.value!;
        const end = endVerse.value || start;

        if (!book) {
            error.value = 'Veuillez sélectionner un livre';
            return;
        }

        const response = await $fetch('/api/bible/compare', {
            method: 'POST',
            body: {
                bookId: book.id,
                chapter,
                verseStart: start,
                verseEnd: end,
                versions: selectedVersions.value
            }
        });

        activeComparison.value = response.data as unknown as ActiveComparison;
    } catch (err: any) {
        error.value = err?.message || 'Erreur lors de la comparaison';
        console.error(err);
    } finally {
        loadingComparison.value = false;
    }
};

const closeComparison = async () => {
    if (Object.keys(route.query).length > 0) {
        return await router.push('/bible/compare');
    }
    activeComparison.value = null;
    selectedBookCode.value = undefined;
    selectedChapter.value = null;
    selectedVersions.value = availableVersions.value
        .filter((v: BibleVersion) => ['LSG', 'S21'].includes(v.code))
        .map((v: BibleVersion) => v.id);
    startVerse.value = 1;
    endVerse.value = null;
    error.value = '';
};

const handleAddVersion = async (version: BibleVersion) => {
    if (!activeComparison.value) return;

    // Ajouter la version à la comparaison existante avec placeholder
    const newComparison: SimpleComparison = {
        version,
        verses: [{
            id: 0,
            chapter: activeComparison.value.chapter,
            verse: activeComparison.value.verseRange.start,
            text: 'Chargement...',
            createdAt: new Date(),
            versionId: version.id,
            bookId: activeComparison.value.book.id
        }]
    };

    activeComparison.value.comparisons.push(newComparison);

    selectedVersions.value.push(version.id);
    await startComparison();
};

const handleRemoveVersion = (versionId: number) => {
    if (!activeComparison.value) return;

    activeComparison.value.comparisons = activeComparison.value.comparisons
        .filter(comp => comp.version.id !== versionId);
    selectedVersions.value = selectedVersions.value
        .filter(id => id !== versionId);
};

const handleAddBookmark = (verse: BibleVerse) => {
    // TODO: Implémenter l'ajout aux favoris
    console.log('Ajouter aux favoris:', verse);
};

const handleAddNote = (verse: BibleVerse) => {
    // TODO: Implémenter l'ajout de note
    console.log('Ajouter une note:', verse);
};

// Lifecycle
await Promise.all([
    loadBooks(),
    loadVersions()
]);

initCompare();
await startComparison();
</script>

<template>
    <div>
        <UPage>
            <template #left>
                <UPageAside>
                    <template #top>
                        <UButton
                            to="/bible"
                            color="secondary"
                            variant="ghost"
                            class="w-full justify-start mb-4"
                        >
                            <template #leading>
                                <UIcon name="i-lucide-arrow-left" />
                            </template>
                            Retour à la Bible
                        </UButton>

                        <template v-if="activeComparison">
                            <div class="border-t dark:border-gray-800 pt-4">
                                <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Versions disponibles
                                </p>
                                <div class="space-y-1">
                                    <UButton
                                        v-for="version in availableVersionsForAdd"
                                        :key="version.id"
                                        size="sm"
                                        color="secondary"
                                        variant="soft"
                                        class="w-full justify-start"
                                        @click="handleAddVersion(version)"
                                    >
                                        <div class="truncate">
                                            <span class="font-medium">{{ version.name }}</span>
                                            <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">({{ version.code }})</span>
                                        </div>
                                    </UButton>
                                </div>
                            </div>
                        </template>
                    </template>
                </UPageAside>
            </template>

            <template #default>
                <UPageHeader
                    title="Comparaison de versions bibliques"
                    description="Comparez différentes versions de la Bible sur un même passage."
                >
                    <template
                        v-if="activeComparison"
                        #right
                    >
                        <UButton
                            color="secondary"
                            variant="ghost"
                            icon="i-lucide-x"
                            @click="closeComparison()"
                        >
                            Fermer
                        </UButton>
                    </template>
                </UPageHeader>

                <UPageBody>
                    <UCard
                        v-if="!activeComparison"
                    >
                        <template #header>
                            <h3 class="text-lg font-medium">
                                Sélectionner le passage à comparer
                            </h3>
                        </template>

                        <form
                            class="space-y-6"
                            @submit.prevent="startComparison"
                        >
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <UFormField label="Livre">
                                    <USelectMenu
                                        v-model="selectedBookCode"
                                        :items="booksOptions"
                                        :loading="loadingBooks"
                                        label-key="name"
                                        value-key="code"
                                        placeholder="Sélectionner un livre"
                                        searchable
                                        search-placeholder="Rechercher un livre..."
                                        class="max-w-52 w-full"
                                    />
                                </UFormField>

                                <UFormField label="Chapitre">
                                    <UInput
                                        v-model.number="selectedChapter"
                                        type="number"
                                        min="1"
                                        :max="selectedBookData?.chapterCount || 150"
                                        placeholder="Numéro de chapitre"
                                        :disabled="!selectedBookCode"
                                        class="max-w-52 w-full"
                                    />
                                </UFormField>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <UFormField label="Verset de début">
                                    <UInput
                                        v-model.number="startVerse"
                                        type="number"
                                        min="1"
                                        placeholder="1"
                                        :disabled="!selectedBookCode || !selectedChapter"
                                        class="max-w-52 w-full"
                                    />
                                </UFormField>

                                <UFormField label="Verset de fin (optionnel)">
                                    <UInput
                                        v-model.number="endVerse"
                                        type="number"
                                        :min="startVerse || 1"
                                        placeholder="Même verset"
                                        :disabled="!selectedBookCode || !selectedChapter"
                                        class="max-w-52 w-full"
                                    />
                                </UFormField>
                            </div>

                            <UFormField
                                label="Versions à comparer"
                                required
                                :description="`${selectedVersions.length} version(s) sélectionnée(s) (minimum 2, maximum 6)`"
                            >
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div
                                        v-for="version in availableVersions"
                                        :key="version.id"
                                        :class="[
                                            'p-3 rounded-lg border transition-colors cursor-pointer',
                                            selectedVersions.includes(version.id)
                                                ? 'bg-primary-50 dark:bg-primary-950 border-primary-200 dark:border-primary-800'
                                                : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        ]"
                                        @click="toggleVersion(version.id, !selectedVersions.includes(version.id))"
                                    >
                                        <div class="flex items-center gap-3">
                                            <UCheckbox
                                                :model-value="selectedVersions.includes(version.id)"
                                                :disabled="selectedVersions.length >= 6 && !selectedVersions.includes(version.id)"
                                            />
                                            <div>
                                                <div class="font-medium text-gray-900 dark:text-white">
                                                    {{ version.name }}
                                                </div>
                                                <div class="text-xs text-gray-500 dark:text-gray-400">
                                                    {{ version.code }} • {{ version.language }}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </UFormField>

                            <div class="flex items-center flex-row-reverse justify-between pt-4">
                                <UButton
                                    type="submit"
                                    :loading="loadingComparison"
                                    :disabled="!canStartComparison"
                                    color="primary"
                                >
                                    Démarrer la comparaison
                                </UButton>
                            </div>
                        </form>
                    </UCard>

                    <div v-else>
                        <BibleComparison
                            :book="activeComparison.book"
                            :chapter="activeComparison.chapter"
                            :verse-range="activeComparison.verseRange"
                            :comparisons="activeComparison.comparisons"
                            :available-versions="availableVersionsForAdd"
                            @close="closeComparison"
                            @add-version="handleAddVersion"
                            @remove-version="handleRemoveVersion"
                            @add-bookmark="handleAddBookmark"
                            @add-note="handleAddNote"
                        />
                    </div>
                </UPageBody>
            </template>
        </UPage>
    </div>
</template>

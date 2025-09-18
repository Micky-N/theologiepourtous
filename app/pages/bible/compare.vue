<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
        <!-- Navigation de retour -->
        <div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-center justify-between h-16">
                    <div class="flex items-center">
                        <NuxtLink
                            to="/bible"
                            class="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        >
                            <UIcon
                                name="i-lucide-arrow-left"
                                class="w-4 h-4"
                            />
                            Retour à la Bible
                        </NuxtLink>
                    </div>
                    <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
                        Comparaison de versions
                    </h1>
                    <div />
                </div>
            </div>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Sélecteur de passage si aucune comparaison n'est active -->
            <div
                v-if="!activeComparison"
                class="max-w-2xl mx-auto"
            >
                <UCard>
                    <template #header>
                        <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                            Sélectionner un passage à comparer
                        </h2>
                        <p class="text-gray-600 dark:text-gray-400 mt-1">
                            Choisissez le livre, chapitre et versets à comparer entre différentes versions
                        </p>
                    </template>

                    <form
                        class="space-y-6"
                        @submit.prevent="startComparison"
                    >
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <UFormGroup label="Livre">
                                <USelectMenu
                                    v-model="selectedBook"
                                    :options="booksOptions"
                                    option-attribute="name"
                                    value-attribute="id"
                                    :loading="loadingBooks"
                                    placeholder="Sélectionner un livre"
                                />
                            </UFormGroup>

                            <UFormGroup label="Chapitre">
                                <UInput
                                    v-model.number="selectedChapter"
                                    type="number"
                                    min="1"
                                    :max="selectedBookData?.chapterCount || 150"
                                    placeholder="Numéro de chapitre"
                                    :disabled="!selectedBook"
                                />
                            </UFormGroup>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <UFormGroup label="Verset de début">
                                <UInput
                                    v-model.number="startVerse"
                                    type="number"
                                    min="1"
                                    placeholder="1"
                                    :disabled="!selectedBook || !selectedChapter"
                                />
                            </UFormGroup>

                            <UFormGroup label="Verset de fin (optionnel)">
                                <UInput
                                    v-model.number="endVerse"
                                    type="number"
                                    :min="startVerse || 1"
                                    placeholder="Même verset"
                                    :disabled="!selectedBook || !selectedChapter"
                                />
                            </UFormGroup>
                        </div>

                        <UFormGroup label="Versions à comparer (sélectionnez 2 à 6 versions)">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div
                                    v-for="version in availableVersions"
                                    :key="version.id"
                                    class="flex items-center space-x-2"
                                >
                                    <UCheckbox
                                        :model-value="selectedVersions.includes(version.id)"
                                        :disabled="selectedVersions.length >= 6 && !selectedVersions.includes(version.id)"
                                        @update:model-value="(checked: boolean | 'indeterminate') => toggleVersion(version.id, checked)"
                                    />
                                    <div class="flex-1">
                                        <div class="text-sm font-medium text-gray-900 dark:text-white">
                                            {{ version.name }}
                                        </div>
                                        <div class="text-xs text-gray-500 dark:text-gray-400">
                                            {{ version.code }} • {{ version.language }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="mt-2 text-xs text-gray-500">
                                {{ selectedVersions.length }} version(s) sélectionnée(s)
                                (minimum 2, maximum 6)
                            </div>
                        </UFormGroup>

                        <div class="flex justify-end">
                            <UButton
                                type="submit"
                                :loading="loadingComparison"
                                :disabled="!canStartComparison"
                                size="lg"
                            >
                                Démarrer la comparaison
                            </UButton>
                        </div>
                    </form>
                </UCard>
            </div>

            <!-- Composant de comparaison -->
            <div
                v-else
                class="w-full"
            >
                <BibleComparison
                    :book="activeComparison.book"
                    :chapter="activeComparison.chapter"
                    :verse-range="activeComparison.verseRange"
                    :comparisons="activeComparison.comparisons as any"
                    :available-versions="availableVersionsForAdd as any"
                    @close="closeComparison"
                    @add-version="handleAddVersion as any"
                    @remove-version="handleRemoveVersion"
                    @add-bookmark="handleAddBookmark as any"
                    @add-note="handleAddNote as any"
                />
            </div>

            <!-- Message d'erreur -->
            <UAlert
                v-if="error"
                color="error"
                variant="soft"
                class="mt-4"
                :title="error"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import type {
    BibleVersion,
    BibleBook,
    BibleVerse
} from '~/types/models'

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

// Utilisation des composables (temporairement désactivés pour compilation)
// const { versions: availableVersions, fetchVersions } = useBibleVersions()
// const { comparison, loading: loadingComparison, error: comparisonError, compareVerses } = useBibleComparison()

// Variables temporaires pour remplacer les composables
const availableVersions = ref<BibleVersion[]>([])
const loadingComparison = ref(false)// Configuration de la page
definePageMeta({
    middleware: 'auth' as any,
    layout: 'bible'
})

// État de la page
const loadingBooks = ref(false)
const error = ref('')

// Sélection du passage
const selectedBook = ref<number | null>(null)
const selectedChapter = ref<number | null>(null)
const startVerse = ref<number | null>(1)
const endVerse = ref<number | null>(null)
const selectedVersions = ref<number[]>([])

// Données
const booksOptions = ref<BibleBook[]>([])
const activeComparison = ref<ActiveComparison | null>(null)

// Computed
const selectedBookData = computed(() =>
    booksOptions.value.find(book => book.id === selectedBook.value)
)

const canStartComparison = computed(() =>
    selectedBook.value
    && selectedChapter.value
    && startVerse.value
    && selectedVersions.value.length >= 2
    && selectedVersions.value.length <= 6
)

const availableVersionsForAdd = computed(() =>
    availableVersions.value.filter(version =>
        !activeComparison.value?.comparisons.some(comp => comp.version.id === version.id)
    )
)

// Lifecycle
onMounted(async () => {
    await Promise.all([
        loadBooks(),
        loadVersions()
    ])

    // Pré-sélectionner des versions populaires
    if (availableVersions.value.length > 0) {
        const defaultVersions = availableVersions.value
            .filter((v: BibleVersion) => ['LSG', 'S21', 'NBS'].includes(v.code))
            .slice(0, 2)
            .map((v: BibleVersion) => v.id)

        if (defaultVersions.length >= 2) {
            selectedVersions.value = defaultVersions
        }
    }
})

// Méthodes
const toggleVersion = (versionId: number, checked: boolean | 'indeterminate') => {
    const isChecked = checked === true
    if (isChecked) {
        if (!selectedVersions.value.includes(versionId)) {
            selectedVersions.value.push(versionId)
        }
    } else {
        selectedVersions.value = selectedVersions.value.filter(id => id !== versionId)
    }
}

const loadBooks = async () => {
    try {
        loadingBooks.value = true
        const response = await $fetch('/api/bible/books') as any
        booksOptions.value = response.data?.all || response.data || response
    } catch (err) {
        error.value = 'Erreur lors du chargement des livres'
        console.error(err)
    } finally {
        loadingBooks.value = false
    }
}

const loadVersions = async () => {
    try {
        const response = await $fetch('/api/bible/versions') as any
        availableVersions.value = response.data || response
    } catch (err) {
        error.value = 'Erreur lors du chargement des versions'
        console.error(err)
    }
}

const startComparison = async () => {
    if (!canStartComparison.value) return

    try {
        error.value = ''
        loadingComparison.value = true

        const book = selectedBookData.value
        const chapter = selectedChapter.value!
        const start = startVerse.value!
        const end = endVerse.value || start

        if (!book) {
            error.value = 'Veuillez sélectionner un livre'
            return
        }

        await $fetch('/api/bible/compare', {
            method: 'POST',
            body: {
                bookCode: book.code,
                chapter,
                startVerse: start,
                endVerse: end,
                versions: selectedVersions.value
            }
        })

        // Simplification temporaire de la structure de comparaison
        activeComparison.value = {
            book,
            chapter,
            verseRange: { start, end },
            comparisons: []
        }
    } catch (err: any) {
        error.value = err?.message || 'Erreur lors de la comparaison'
        console.error(err)
    } finally {
        loadingComparison.value = false
    }
}

const closeComparison = () => {
    activeComparison.value = null
    error.value = ''
}

const handleAddVersion = async (version: BibleVersion) => {
    if (!activeComparison.value) return

    try {
        // Ajouter la version à la comparaison existante
        const newComparison: SimpleComparison = {
            version,
            verses: [{
                id: 0,
                chapter: activeComparison.value.chapter,
                verse: activeComparison.value.verseRange.start,
                text: 'Chargement...',
                createdAt: new Date(),
                versionId: version.id,
                bookId: 0
            }]
        }

        activeComparison.value.comparisons.push(newComparison)

        // TODO: Charger le verset réel pour cette version
    } catch (err) {
        console.error('Erreur lors de l\'ajout de version:', err)
    }
}

const handleRemoveVersion = (versionId: number) => {
    if (!activeComparison.value) return

    activeComparison.value.comparisons = activeComparison.value.comparisons
        .filter(comp => comp.version.id !== versionId)
}

const handleAddBookmark = (verse: BibleVerse) => {
    // TODO: Implémenter l'ajout aux favoris
    console.log('Ajouter aux favoris:', verse)
}

const handleAddNote = (verse: BibleVerse) => {
    // TODO: Implémenter l'ajout de note
    console.log('Ajouter une note:', verse)
}
</script>

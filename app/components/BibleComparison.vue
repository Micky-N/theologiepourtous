<template>
    <div class="bible-comparison">
        <UCard>
            <template #header>
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                            Comparaison : {{ book.name }} {{ chapter }}:{{ verseRange.start }}<span v-if="verseRange.end > verseRange.start">-{{ verseRange.end }}</span>
                        </h2>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {{ comparisons.length }} versions côte à côte
                        </p>
                    </div>
                    <div class="flex gap-2">
                        <UButton
                            icon="i-lucide-settings"
                            variant="ghost"
                            size="sm"
                            @click="showSettings = !showSettings"
                        />
                        <UButton
                            icon="i-lucide-x"
                            variant="ghost"
                            size="sm"
                            @click="$emit('close')"
                        />
                    </div>
                </div>
            </template>

            <!-- Panneau de configuration -->
            <div
                v-if="showSettings"
                class="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
                <h3 class="font-medium text-gray-900 dark:text-white mb-3">
                    Options d'affichage
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <UFormField label="Layout">
                        <USelectMenu
                            v-model="layoutMode"
                            :items="layoutOptions"
                            label-key="label"
                            value-key="value"
                        />
                    </UFormField>

                    <UFormField label="Taille du texte">
                        <USelectMenu
                            v-model="fontSize"
                            :items="fontSizeOptions"
                            label-key="label"
                            value-key="value"
                        />
                    </UFormField>

                    <div class="flex items-center gap-2 pt-6">
                        <UCheckbox
                            v-model="showVerseNumbers"
                            label="Numéros de versets"
                        />
                    </div>
                </div>
            </div>

            <!-- Comparaison côte à côte -->
            <div
                class="comparison-grid gap-4"
                :class="{
                    'grid-cols-1': layoutMode === 'vertical',
                    'grid-cols-2': layoutMode === 'side-by-side' && comparisons.length === 2,
                    'grid-cols-3': layoutMode === 'side-by-side' && comparisons.length === 3,
                    'grid-cols-2 lg:grid-cols-4': layoutMode === 'side-by-side' && comparisons.length === 4,
                    'grid-cols-2 lg:grid-cols-3': layoutMode === 'side-by-side' && comparisons.length >= 5,
                    'comparison-horizontal': layoutMode === 'horizontal'
                }"
            >
                <div
                    v-for="comparison in comparisons"
                    :key="comparison.version.id"
                    class="version-column"
                >
                    <!-- En-tête de version -->
                    <div class="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 z-10">
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="font-semibold text-gray-900 dark:text-white">
                                    {{ comparison.version.name }}
                                </h3>
                                <p class="text-xs text-gray-500 dark:text-gray-400">
                                    {{ comparison.version.code }} • {{ comparison.version.language }}
                                </p>
                            </div>
                            <UButton
                                v-if="comparisons.length > 2"
                                icon="i-lucide-x"
                                variant="ghost"
                                size="xs"
                                @click="removeVersion(comparison.version.id)"
                            />
                        </div>
                    </div>

                    <!-- Versets -->
                    <div class="verses-container space-y-3">
                        <div
                            v-for="verse in comparison.verses"
                            :key="`${comparison.version.id}-${verse.id}`"
                            class="verse-item"
                            :class="fontSize"
                        >
                            <div class="flex items-start gap-2">
                                <span
                                    v-if="showVerseNumbers"
                                    class="verse-number flex-shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md min-w-[2rem] text-center"
                                >
                                    {{ verse.verse }}
                                </span>
                                <p
                                    class="verse-text leading-relaxed text-gray-800 dark:text-gray-200"
                                    :class="{
                                        'text-sm': fontSize === 'small',
                                        'text-base': fontSize === 'normal',
                                        'text-lg': fontSize === 'large',
                                        'text-xl': fontSize === 'extra-large'
                                    }"
                                >
                                    {{ verse.text }}
                                </p>
                            </div>

                            <!-- Actions sur le verset -->
                            <div class="verse-actions opacity-0 group-hover:opacity-100 transition-opacity mt-2 flex gap-2">
                                <UButton
                                    title="Ajouter aux favoris"
                                    icon="i-lucide-bookmark"
                                    variant="ghost"
                                    size="xs"
                                    @click="addBookmark(verse)"
                                />
                                <UButton
                                    title="Ajouter une note"
                                    icon="i-lucide-sticky-note"
                                    variant="ghost"
                                    size="xs"
                                    @click="addNote(verse)"
                                />
                                <UButton
                                    title="Copier le verset"
                                    icon="i-lucide-copy"
                                    variant="ghost"
                                    size="xs"
                                    @click="copyVerse(verse, comparison.version)"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Message si aucun verset -->
                    <div
                        v-if="comparison.verses.length === 0"
                        class="text-center py-8 text-gray-500 dark:text-gray-400"
                    >
                        <UIcon
                            name="i-lucide-book-x"
                            class="w-8 h-8 mx-auto mb-2"
                        />
                        <p>
                            Aucun verset trouvé pour cette version
                        </p>
                    </div>
                </div>
            </div>

            <!-- Actions globales -->
            <template #footer>
                <div class="flex items-center justify-between">
                    <div class="flex gap-2">
                        <UButton
                            :disabled="comparisons.length >= 6"
                            icon="i-lucide-plus"
                            label="Ajouter version"
                            variant="outline"
                            size="sm"
                            @click="showVersionSelector = true"
                        />
                        <UButton
                            icon="i-lucide-download"
                            label="Exporter"
                            variant="outline"
                            size="sm"
                            @click="exportComparison"
                        />
                    </div>

                    <div class="text-xs text-gray-500 dark:text-gray-400">
                        Maximum 6 versions simultanées
                    </div>
                </div>
            </template>
        </UCard>

        <!-- Sélecteur de version -->
        <UModal
            v-model:open="showVersionSelector"
            title="Ajouter une version"
            description="Sélectionnez une version à ajouter à la comparaison"
        >
            <template #body>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                        v-for="version in availableVersions"
                        :key="version.id"
                        class="p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        @click="addVersion(version)"
                    >
                        <div class="font-medium">
                            {{ version.name }}
                        </div>
                        <div class="text-sm text-gray-500">
                            {{ version.code }} • {{ version.language }}
                        </div>
                    </div>
                </div>
            </template>
            <template #footer>
                <UButton
                    label="Annuler"
                    variant="ghost"
                    @click="showVersionSelector = false"
                />
            </template>
        </UModal>
    </div>
</template>

<script setup lang="ts">
import type { BibleBook, BibleVerse, BibleVersion } from '@prisma/client';

interface Comparison {
    version: BibleVersion
    verses: BibleVerse[]
}

interface Props {
    book: BibleBook
    chapter: number
    verseRange: {
        start: number
        end: number
    }
    comparisons: Comparison[]
    availableVersions?: BibleVersion[]
}

const emit = defineEmits<{
    close: []
    addVersion: [version: BibleVersion]
    removeVersion: [versionId: number]
    addBookmark: [verse: BibleVerse]
    addNote: [verse: BibleVerse]
}>();

const props = withDefaults(defineProps<Props>(), {
    availableVersions: () => []
});

// État local
const showSettings = ref(false);
const showVersionSelector = ref(false);
const layoutMode = ref<'side-by-side' | 'vertical' | 'horizontal'>('side-by-side');
const fontSize = ref<'small' | 'normal' | 'large' | 'extra-large'>('normal');
const showVerseNumbers = ref(true);

// Options de configuration
const layoutOptions = [
    { label: 'Côte à côte', value: 'side-by-side' },
    { label: 'Vertical', value: 'vertical' },
    { label: 'Horizontal', value: 'horizontal' }
];

const fontSizeOptions = [
    { label: 'Petit', value: 'small' },
    { label: 'Normal', value: 'normal' },
    { label: 'Grand', value: 'large' },
    { label: 'Très grand', value: 'extra-large' }
];

// Méthodes
const addVersion = (version: BibleVersion) => {
    if (props.comparisons.length < 6) {
        emit('addVersion', version);
        showVersionSelector.value = false;
    }
};

const removeVersion = (versionId: number) => {
    emit('removeVersion', versionId);
};

const addBookmark = (verse: BibleVerse) => {
    emit('addBookmark', verse);
};

const addNote = (verse: BibleVerse) => {
    emit('addNote', verse);
};

const copyVerse = async (verse: BibleVerse, version: BibleVersion) => {
    const text = `${props.book.name} ${props.chapter}:${verse.verse} (${version.code})\n"${verse.text}"`;

    try {
        await navigator.clipboard.writeText(text);
        // TODO: Ajouter toast de succès
    } catch (error) {
        console.error('Erreur lors de la copie:', error);
        // TODO: Ajouter toast d'erreur
    }
};

const exportComparison = () => {
    const content = props.comparisons.map((comparison) => {
        const versesText = comparison.verses.map(verse =>
            `${verse.verse}. ${verse.text}`
        ).join('\n');

        return `${comparison.version.name} (${comparison.version.code})\n${versesText}`;
    }).join('\n\n---\n\n');

    const fullContent = `${props.book.name} ${props.chapter}:${props.verseRange.start}${props.verseRange.end > props.verseRange.start ? `-${props.verseRange.end}` : ''}\n\n${content}`;

    const blob = new Blob([fullContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${props.book.code}_${props.chapter}_${props.verseRange.start}-${props.verseRange.end}_comparison.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
</script>

<style scoped>
@reference '~/assets/css/main.css';
.comparison-grid {
    display: grid;
}

.comparison-horizontal {
    display: block;
}

.comparison-horizontal .version-column {
    margin-bottom: 2rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid var(--color-gray-200);
}

.comparison-horizontal .version-column:last-child {
    border-bottom: none;
}

.verse-item {
    @apply p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors;
}

.version-column {
    @apply border-r border-gray-200 dark:border-gray-700 pr-4;
}

.version-column:last-child {
    @apply border-r-0 pr-0;
}

@media (max-width: 768px) {
    .version-column {
        @apply border-r-0 border-b border-gray-200 dark:border-gray-700 pr-0 pb-4 mb-4;
    }
    .version-column:last-child {
        @apply border-b-0 pb-0 mb-0;
    }
}
</style>

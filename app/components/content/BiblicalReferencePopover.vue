<template>
    <UPopover
        v-model:open="open"
        mode="hover"
    >
        <a
            :id="verse"
            class="hover:underline"
        >
            <slot />
        </a>

        <template #content>
            <div
                class="w-72 max-w-xs p-2"
            >
                <div
                    v-if="loading"
                    class="flex items-center gap-2 text-gray-600"
                >
                    <UIcon
                        name="i-heroicons-arrow-path-20-solid"
                        class="animate-spin"
                    />
                    <span>Chargement du verset…</span>
                </div>

                <div
                    v-else-if="error"
                    class="text-sm text-red-600"
                >
                    {{ error }}
                </div>

                <div
                    v-else-if="data"
                    class="space-y-1"
                >
                    <div class="text-xs text-gray-500">
                        {{ data.reference }}
                    </div>
                    <div class="italic text-gray-800 leading-relaxed">
                        <template
                            v-for="(v, index) in data.verses"
                            :key="v.id"
                        >
                            <sup class="text-xs text-primary-600 dark:text-primary-400">{{ v.verse }}</sup>
                            <span v-html="v.text" /><span v-if="index < data.verses.length - 1" />
                            <span v-if="!isNextVerse(v.verse, data.verses[index + 1]?.verse)"> [...] </span>
                        </template>
                    </div>
                </div>
            </div>
        </template>
    </UPopover>
</template>

<script setup lang="ts">
import type { BibleBook, BibleVerse, BibleVersion } from '~~/src/database/models';
import { ref, watch } from 'vue';

type Verse = BibleVerse & { book: BibleBook; version: BibleVersion; };

type VerseData = {
    reference: string;
    verses: Verse[];
};

const { user } = useUserSession();
const { verse } = defineProps<{
    verse: string;
}>();

const open = ref(false);
const loading = ref(false);
const error = ref<string | null>(null);
const data = ref<VerseData | null>(null);

// Cache simple en mémoire pour éviter les appels répétés
const cache = useState('cache', () => new Map<string, VerseData>());

async function fetchVerseFromApiSim(verseRef: string): Promise<VerseData> {
    const verseObj = verseParser(verseRef);
    verseObj.version = verseObj.version || user.value?.preferences.defaultVersion?.code || 'LSG';
    const response = await $fetch(`/api/bible/verses/${verseObj.book}/${verseObj.chapter}/${verseObj.verse}`, {
        method: 'GET',
        query: { version: verseObj.version }
    });

    if (!response.success) {
        throw new Error('Erreur lors du chargement du verset.');
    }
    const meta = response.meta;

    return {
        reference: meta.summary,
        verses: response.data as unknown as Verse[]
    };
}

async function ensureVerseLoaded() {
    error.value = null;
    if (cache.value.has(verse)) {
        data.value = cache.value.get(verse) as VerseData;
        return;
    }
    loading.value = true;
    data.value = null;
    try {
        const res = await fetchVerseFromApiSim(verse);
        cache.value.set(verse, res);
        data.value = res;
    } catch {
        error.value = 'Impossible de charger le verset.';
    } finally {
        loading.value = false;
    }
}

const isNextVerse = (v1: number, v2: number | undefined) => {
    return v2 == undefined || v1 + 1 === v2;
};

// Charge lorsque le popover s’ouvre
watch(open, (val) => {
    if (val) {
        ensureVerseLoaded();
    }
});

// Réinitialise les données si la référence change
watch(() => verse, () => {
    data.value = cache.value.get(verse) ?? null;
    error.value = null;
});
</script>

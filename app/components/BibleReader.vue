<template>
    <div class="space-y-6">
        <UCard class="mb-4">
            <template #header>
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div class="flex flex-1 items-center gap-2">
                        <p>Chapitre</p>
                        <USelectMenu
                            :items="chapters"
                            :model-value="chapter"
                            placeholder="Chapitre"
                            class="w-32"
                            @update:model-value="handleChapterChange"
                        />
                    </div>
                    <UButton
                        color="secondary"
                        variant="ghost"
                        to="/bible/compare"
                        trailing-icon="i-lucide-chevron-right"
                    >
                        Comparer
                    </UButton>
                </div>
            </template>
            <div class="space-x-1">
                <BibleVerse
                    v-for="verse in currentVerses"
                    :key="verse.id"
                    :verse="verse"
                    @show-compare="showCompare"
                    @open-bookmark-form="openBookmarkForm"
                    @add-note="addNote"
                />
            </div>
            <template #footer>
                <div class="flex justify-center gap-2">
                    <UButton
                        v-if="versesData?.navigation.previousChapter"
                        icon="i-lucide-arrow-left"
                        color="primary"
                        variant="soft"
                        @click="handleChapterChange(versesData.navigation.previousChapter)"
                    >
                        Précédent
                    </UButton>
                    <UButton
                        v-if="versesData?.navigation.nextChapter"
                        trailing-icon="i-lucide-arrow-right"
                        color="primary"
                        variant="soft"
                        @click="handleChapterChange(versesData.navigation.nextChapter)"
                    >
                        Suivant
                    </UButton>
                </div>
            </template>
        </UCard>
        <BibleCompareModal
            v-if="activedVerse"
            v-model="openedCompare"
            v-bind="activedVerse"
            :available-versions="versions"
        />
        <BibleNoteFormModal
            v-if="activedVerse"
            v-model="openedAddNote"
            :verse="activedVerse"
        />
    </div>
</template>

<script lang="ts" setup>
import type { $Enums, BibleBook, BibleVersion } from '@prisma/client';
import { computed } from 'vue';

interface ApiVerseResponseData {
    book: {
        name: string
        code: string
        testament: $Enums.Testament
    }
    chapter: number
    version: {
        name: string
        code: string
    }
    verses: {
        text: string
        chapter: number
        id: number
        verse: number
    }[]
    navigation: {
        previousChapter: number | null
        nextChapter: number | null
        totalChapters: number
    }
}

interface ActivedVerse {
    book: { code: string, name: string }
    chapter: number
    verseStart: number
    version: number
}

const props = defineProps<{
    book: BibleBook
    chapter: number
    versesData: ApiVerseResponseData
    versions: BibleVersion[]
    selectedVersion: BibleVersion
}>();

const showCompare = (verseId: number) => {
    activedVerse.value = {
        book: { code: props.book.code, name: props.book.name },
        verseStart: verseId,
        chapter: props.chapter,
        version: props.selectedVersion.id
    };
    openedCompare.value = true;
};

const openBookmarkForm = (verseId: number) => {
    activedVerse.value = {
        book: { code: props.book.code, name: props.book.name },
        verseStart: verseId,
        chapter: props.chapter,
        version: props.selectedVersion.id
    };
    openedBookmark.value = true;
};

const activedVerse = ref<ActivedVerse | null>(null);

const addNote = (verseId: number) => {
    activedVerse.value = {
        book: { code: props.book.code, name: props.book.name },
        verseStart: verseId,
        chapter: props.chapter,
        version: props.selectedVersion.id
    };
    openedAddNote.value = true;
};

const openedCompare = ref(false);
const openedBookmark = ref(false);
const openedAddNote = ref(false);

const emit = defineEmits<{
    (e: 'update:chapter', value: number): void
}>();

const chapters = computed(() => {
    return Array.from({ length: props.versesData?.navigation.totalChapters || 0 }, (_, i) => i + 1);
});

const currentVerses = computed(() => props.versesData?.verses || []);

const handleChapterChange = (chapter: number) => {
    emit('update:chapter', chapter);
};
</script>

<style>

</style>

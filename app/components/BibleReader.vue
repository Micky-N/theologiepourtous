<template>
    <div class="space-y-6">
        <UCard class="mb-4">
            <template #header>
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div class="flex flex-1 items-center gap-2">
                        <p>Chapitre</p>
                        <USelectMenu
                            :items="chapters"
                            :model-value="versesData.chapter"
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
                    :book="versesData.book"
                    :verse="verse"
                    :notes="getVerseNotes(verse.verse)"
                    :bookmark="getVerseBookmark(verse.verse)"
                    @show-compare="showCompare"
                    @add-note="addNote"
                    @refresh-bookmark="emit('refreshBookmark')"
                    @refresh-note="emit('refreshNotes')"
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
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { BibleBookmark, BibleNote, BibleVerse, BibleVersion } from '~~/src/database/models';
import type { Testament } from '~~/src/enums/bibleType';

interface ApiVerseResponseData {
    book: {
        name: string;
        code: string;
        testament: Testament;
    };
    chapter: number;
    version: {
        name: string;
        code: string;
        id: number;
    };
    verses: BibleVerse[];
    navigation: {
        previousChapter: number | null;
        nextChapter: number | null;
        totalChapters: number;
    };
}

interface ActivedVerse {
    book: { code: string; name: string; };
    chapter: number;
    verseStart: number;
    version: number;
}

const props = defineProps<{
    versesData: ApiVerseResponseData;
    notes: (BibleNote & { verse: { chapter: number; verse: number; text: string; version: { code: string; name: string; }; }; })[];
    bookmarks: (BibleBookmark & { verse: { chapter: number; verse: number; text: string; version: { code: string; name: string; }; }; })[];
    versions: BibleVersion[];
}>();

const showCompare = (verseId: number) => {
    activedVerse.value = {
        book: { code: props.versesData.book.code, name: props.versesData.book.name },
        verseStart: verseId,
        chapter: props.versesData.chapter,
        version: props.versesData.version.id
    };
    openedCompare.value = true;
};

const activedVerse = ref<ActivedVerse | null>(null);

const addNote = (verseId: number) => {
    activedVerse.value = {
        book: { code: props.versesData.book.code, name: props.versesData.book.name },
        verseStart: verseId,
        chapter: props.versesData.chapter,
        version: props.versesData.version.id
    };
    openedAddNote.value = true;
};

const openedCompare = ref(false);
const openedAddNote = ref(false);

const emit = defineEmits<{
    (e: 'update:chapter', value: number): void;
    (e: 'refreshBookmark' | 'refreshNotes'): void;
}>();

const chapters = computed(() => {
    return Array.from({ length: props.versesData?.navigation.totalChapters || 0 }, (_, i) => i + 1);
});

const getVerseNotes = (verse: number) => {
    return props.notes.filter(note => note.verse.verse === verse) || [];
};

const getVerseBookmark = (verse: number) => {
    return props.bookmarks.find(bookmark => bookmark.verse.verse === verse) || null;
};

const currentVerses = computed(() => props.versesData?.verses || []);

const handleChapterChange = (chapter: number) => {
    emit('update:chapter', chapter);
};
</script>

<style>

</style>

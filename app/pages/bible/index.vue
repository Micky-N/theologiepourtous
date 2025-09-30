<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';
import type { $Enums, BibleBook, BibleBookmark, BibleNote, BibleVerse, BibleVersion } from '@prisma/client';

interface ApiVerseResponseData {
    book: {
        name: string;
        code: string;
        testament: $Enums.Testament;
    };
    chapter: number;
    version: {
        name: string;
        code: string;
    };
    verses: BibleVerse[];
    navigation: {
        previousChapter: number | null;
        nextChapter: number | null;
        totalChapters: number;
    };
}

interface ChapterRead {
    bookCode: string;
    chaptersId: number[];
}

interface ReadingSession {
    id: number;
    chaptersRead: ChapterRead[];
}

definePageMeta({
    layout: 'bible'
});
const route = useRoute();
const { user, loggedIn } = useUserSession();
const { data: booksData } = await useAsyncData('bible-books', () => $fetch<{ data: { all: BibleBook[]; grouped: { old: BibleBook[]; new: BibleBook[]; }; }; }>('/api/bible/books'), { transform: data => data?.data || [] });
const { data: availableVersions } = await useAsyncData('bible-versions', () => $fetch<{ data: BibleVersion[]; }>('/api/bible/versions'), { transform: data => data?.data || [] });
const { data: selectedChapterVerses } = await useAsyncData(
    'bible-verses',
    () => $fetch<{ data: ApiVerseResponseData; }>(`/api/bible/verses/${route.query.book || 'GEN'}/${route.query.chapter || '1'}`, {
        query: {
            version: route.query.version || user.value?.preferences?.defaultVersion?.code || 'LSG'
        }
    }),
    {
        watch: [() => route.query],
        transform: data => data?.data || []
    }
);

const router = useRouter();
const selectedBookCode = computed<string>({
    get: () => route.query.book as string || 'GEN',
    set: (value: string | undefined) => {
        router.push({ query: { ...route.query, book: value } });
    }
});
const selectedChapter = computed<number>({
    get: () => parseInt(route.query.chapter as string || '1'),
    set: (value: number) => {
        router.push({ query: { ...route.query, chapter: value } });
    }
});
const selectedVersionCode = computed<string>({
    get: () => route.query.version as string || user.value?.preferences.defaultVersion?.code || 'LSG',
    set: (value: string | undefined) => {
        router.push({ query: { ...route.query, version: value } });
    }
});
const books = computed<BibleBook[]>(() => booksData.value?.all || []);
const currentSession = ref<ReadingSession | null>(null);
const chaptersRead = ref<ChapterRead[]>([]);
const notes = ref<(BibleNote & { verse: { chapter: number; verse: number; text: string; version: { code: string; name: string; }; }; })[]>([]);
const bookmarks = ref<(BibleBookmark & {
    verse: { chapter: number; verse: number; text: string; version: { code: string; name: string; }; };
})[]>([]);

const booksNavigation = computed<NavigationMenuItem[]>(() => {
    const booksGrouped = booksData.value?.grouped || { old: [], new: [] };
    const oldTestamentBooks = booksGrouped.old;
    const newTestamentBooks = booksGrouped.new;
    return [
        {
            label: 'Ancien Testament',
            open: oldTestamentBooks.some(book => book.code === selectedBookCode.value),
            active: oldTestamentBooks.some(book => book.code === selectedBookCode.value),
            ui: {
                link: 'cursor-pointer'
            },
            children: oldTestamentBooks.map(book => ({
                label: book.name,
                onSelect: async () => await updateBook(book.code),
                active: selectedBookCode.value === book.code,
                ui: {
                    link: 'cursor-pointer'
                }
            }))
        },
        {
            label: 'Nouveau Testament',
            open: newTestamentBooks.some(book => book.code === selectedBookCode.value),
            active: newTestamentBooks.some(book => book.code === selectedBookCode.value),
            ui: {
                link: 'cursor-pointer'
            },
            children: newTestamentBooks.map(book => ({
                label: book.name,
                onSelect: async () => await updateBook(book.code),
                active: selectedBookCode.value === book.code,
                ui: {
                    link: 'cursor-pointer'
                }
            }))
        }
    ] as NavigationMenuItem[];
});

const availableVersionsNavigation = computed<NavigationMenuItem[]>(() => {
    if (!availableVersions.value) return [];
    return availableVersions.value.map(version => ({
        label: version.name,
        to: router.resolve({ query: { ...route.query, version: version.code } }).href,
        active: selectedVersionCode.value === version.code
    }));
});

const selectedBook = computed(() => {
    if (!books.value || !selectedBookCode.value) return null;
    return books.value.find(book => book.code == selectedBookCode.value);
});

const selectedVersion = computed(() => {
    if (!availableVersions.value || !selectedVersionCode.value) return null;
    return availableVersions.value.find(version => version.code == selectedVersionCode.value);
});

const updateBook = async (bookCode: string) => {
    await router.push({ query: { ...route.query, book: bookCode, chapter: 1 } });
};

const updateChaptersRead = (bookCode: string, chapterId: number) => {
    if (!chaptersRead.value) return;

    const bookEntry = chaptersRead.value.find(item => item.bookCode === bookCode);

    if (!bookEntry) {
        // Nouveau livre
        chaptersRead.value.push({
            bookCode,
            chaptersId: [chapterId]
        });
    } else {
        // Livre existant
        if (!bookEntry.chaptersId.includes(chapterId)) {
            bookEntry.chaptersId.push(chapterId);
        }
    }
};

const updateChapter = async (chapterId: number) => {
    await router.push({ query: { ...route.query, chapter: chapterId } });

    if (loggedIn && selectedBookCode.value) {
        updateChaptersRead(selectedBookCode.value, chapterId);
    }
};

useSeoMeta({
    title: 'Lire la Bible en ligne - Théologie Pour Tous',
    ogTitle: 'Lire la Bible en ligne - Théologie Pour Tous',
    description: 'Lisez la Bible en ligne avec différentes versions disponibles. Parcourez les livres et chapitres de la Bible facilement.',
    ogDescription: 'Lisez la Bible en ligne avec différentes versions disponibles. Parcourez les livres et chapitres de la Bible facilement.'
});

const startReadingSession = async () => {
    if (!loggedIn || !selectedVersion.value || !availableVersions.value) return;

    try {
        const selectedVersionId = availableVersions.value.find(v => v.code === selectedVersionCode.value)?.id;
        if (!selectedVersionId) return;

        const response = await $fetch<{ success: boolean; sessionId: number; }>('/api/reading/sessions', {
            method: 'POST',
            body: {
                action: 'start',
                versionId: selectedVersionId,
                chaptersRead: JSON.stringify([{
                    bookCode: selectedBookCode.value,
                    chaptersId: selectedChapter.value ? [selectedChapter.value] : []
                }])
            }
        });

        if (response.success && response.sessionId) {
            const initialChaptersRead = [{
                bookCode: selectedBookCode.value,
                chaptersId: selectedChapter.value ? [selectedChapter.value] : []
            }];
            currentSession.value = {
                id: response.sessionId,
                chaptersRead: initialChaptersRead
            };
            chaptersRead.value = initialChaptersRead;
        }
    } catch (error) {
        console.error('Erreur lors du démarrage de la session:', error);
    }
};

const endReadingSession = async () => {
    if (!loggedIn || !currentSession.value) return;

    try {
        await $fetch('/api/reading/sessions', {
            method: 'POST',
            body: {
                action: 'end',
                sessionId: currentSession.value.id,
                chaptersRead: JSON.stringify(chaptersRead.value)
            }
        });
    } catch (error) {
        console.error('Erreur lors de la fermeture de la session:', error);
    }
};

onMounted(async () => {
    if (loggedIn) {
        await startReadingSession();
        await loadNotes();
        await loadBookmarks();
    }
});

onBeforeUnmount(async () => {
    if (loggedIn) {
        await endReadingSession();
    }
});

const loadNotes = async () => {
    if (!selectedVersionCode.value || !selectedBookCode.value || !selectedChapter.value) return;

    try {
        const response = await $fetch<{ data: { notes: (BibleNote & { verse: { chapter: number; verse: number; text: string; version: { code: string; name: string; }; }; })[]; }; }>('/api/bible/notes', {
            method: 'GET',
            query: {
                book: selectedBookCode.value,
                chapter: selectedChapter.value,
                version: selectedVersionCode.value
            }
        });

        notes.value = response?.data.notes || [];
    } catch (error) {
        console.error('Erreur lors du chargement des notes:', error);
    }
};

const loadBookmarks = async () => {
    if (!selectedVersion.value || !selectedBookCode.value || !selectedChapter.value) return;

    try {
        const response = await $fetch<{
            data: {
                bookmarks: (BibleBookmark & {
                    verse: { chapter: number; verse: number; text: string; version: { code: string; name: string; }; };
                })[];
            };
        }>('/api/bible/bookmarks', {
            method: 'GET',
            query: {
                book: selectedBookCode.value,
                chapter: selectedChapter.value,
                version: selectedVersionCode.value
            }
        });
        bookmarks.value = response?.data.bookmarks || [];
    } catch (error) {
        console.error('Erreur lors du chargement des signets:', error);
    }
};

watch([() => route.query.chapter, () => route.query.book], async () => {
    await loadNotes();
    await loadBookmarks();
});

watch(selectedVersionCode, async () => {
    if (user.value?.preferences?.notesPerVersion) {
        await loadNotes();
    }
    if (user.value?.preferences?.bookmarksPerVersion) {
        await loadBookmarks();
    }
});

defineOgImageComponent('Saas');
</script>

<template>
    <UPage>
        <template #left>
            <UPageAside>
                <template #top>
                    Les livres
                </template>

                <UNavigationMenu
                    v-if="books?.length"
                    :items="booksNavigation"
                    highlight
                    orientation="vertical"
                />
            </UPageAside>
        </template>
        <UPageHeader
            v-if="selectedBook && selectedChapter"
            :title="`${selectedBook.name} ${selectedChapter}`"
            :description="selectedVersion?.name || 'Aucune version sélectionnée'"
        />

        <UPageBody>
            <div>
                <BibleReader
                    v-if="selectedBook && selectedChapter && selectedVersion && selectedChapterVerses"
                    :book="selectedBook"
                    :chapter="selectedChapter"
                    :verses-data="selectedChapterVerses"
                    :versions="availableVersions || []"
                    :selected-version="selectedVersion"
                    :notes="notes"
                    :bookmarks="bookmarks"
                    @update:chapter="updateChapter"
                    @refresh-bookmark="loadBookmarks"
                    @refresh-notes="loadNotes"
                />
            </div>
            <USeparator />
        </UPageBody>

        <template
            v-if="availableVersions?.length"
            #right
        >
            <UPageAside>
                <template #top>
                    Versions disponibles
                </template>

                <UNavigationMenu
                    :items="availableVersionsNavigation"
                    variant="link"
                    orientation="vertical"
                />
            </UPageAside>
        </template>
    </UPage>
</template>

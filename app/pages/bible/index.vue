<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';
import type { BibleBook, BibleBookmark, BibleNote, BibleVerse, BibleVersion } from '~~/src/database/models';
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
const { data: booksData } = await useAsyncData('bible-books', () => $fetch<{ data: { all: BibleBook[]; grouped: { old: BibleBook[]; new: BibleBook[]; }; }; }>('/api/bible/books'), {
    transform: data => data?.data || []
});
const { data: availableVersions } = await useAsyncData('bible-versions', () => $fetch<{ data: BibleVersion[]; }>('/api/bible/versions'), { transform: data => data?.data || [] });
const { data: selectedChapterVerses } = await useAsyncData(
    `bible-verses-${route.query.book || 'GEN'}-${route.query.chapter || '1'}-${route.query.version || (user.value?.preferences?.defaultVersion?.code || 'LSG')}`,
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
            open: oldTestamentBooks.some(book => book.code === selectedChapterVerses.value?.book.code),
            active: oldTestamentBooks.some(book => book.code === selectedChapterVerses.value?.book.code),
            ui: {
                link: 'cursor-pointer'
            },
            children: oldTestamentBooks.map(book => ({
                label: book.name,
                onSelect: async () => await updateBook(book.code),
                active: selectedChapterVerses.value?.book.code === book.code,
                ui: {
                    link: 'cursor-pointer'
                }
            }))
        },
        {
            label: 'Nouveau Testament',
            open: newTestamentBooks.some(book => book.code === selectedChapterVerses.value?.book.code),
            active: newTestamentBooks.some(book => book.code === selectedChapterVerses.value?.book.code),
            ui: {
                link: 'cursor-pointer'
            },
            children: newTestamentBooks.map(book => ({
                label: book.name,
                onSelect: async () => await updateBook(book.code),
                active: selectedChapterVerses.value?.book.code === book.code,
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
        active: selectedChapterVerses.value?.version.code === version.code
    }));
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

    if (loggedIn.value && selectedChapterVerses.value) {
        updateChaptersRead(selectedChapterVerses.value.book.code, chapterId);
    }
};

useSeoMeta({
    title: 'Lire la Bible en ligne - Théologie Pour Tous',
    ogTitle: 'Lire la Bible en ligne - Théologie Pour Tous',
    description: 'Lisez la Bible en ligne avec différentes versions disponibles. Parcourez les livres et chapitres de la Bible facilement.',
    ogDescription: 'Lisez la Bible en ligne avec différentes versions disponibles. Parcourez les livres et chapitres de la Bible facilement.'
});

const startReadingSession = async () => {
    if (!loggedIn.value || !selectedChapterVerses.value) return;

    try {
        const { book, chapter, version } = selectedChapterVerses.value;

        const response = await $fetch<{ success: boolean; sessionId: number; }>('/api/reading/sessions', {
            method: 'POST',
            body: {
                action: 'start',
                versionId: version.id,
                chaptersRead: JSON.stringify([{
                    bookCode: book.code,
                    chaptersId: chapter ? [chapter] : []
                }])
            }
        });

        if (response.success && response.sessionId) {
            const initialChaptersRead = [{
                bookCode: book.code,
                chaptersId: chapter ? [chapter] : []
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
    if (!loggedIn.value || !currentSession.value) return;

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
    if (loggedIn.value) {
        await startReadingSession();
        await loadNotes();
        await loadBookmarks();
    }
});

onBeforeUnmount(async () => {
    if (loggedIn.value) {
        await endReadingSession();
    }
});

const loadNotes = async () => {
    if (!selectedChapterVerses.value) return;

    try {
        const { book, chapter, version } = selectedChapterVerses.value;
        const response = await $fetch<{ data: { notes: (BibleNote & { verse: { chapter: number; verse: number; text: string; version: { code: string; name: string; }; }; })[]; }; }>('/api/bible/notes', {
            method: 'GET',
            query: {
                book: book.code,
                chapter: chapter,
                version: version.code
            }
        });

        notes.value = response?.data.notes || [];
    } catch (error) {
        console.error('Erreur lors du chargement des notes:', error);
    }
};

const loadBookmarks = async () => {
    if (!selectedChapterVerses.value) return;

    try {
        const { book, chapter, version } = selectedChapterVerses.value;
        const response = await $fetch<{
            data: {
                bookmarks: (BibleBookmark & {
                    verse: { chapter: number; verse: number; text: string; version: { code: string; name: string; }; };
                })[];
            };
        }>('/api/bible/bookmarks', {
            method: 'GET',
            query: {
                book: book.code,
                chapter: chapter,
                version: version.code
            }
        });
        bookmarks.value = response?.data.bookmarks || [];
    } catch (error) {
        console.error('Erreur lors du chargement des signets:', error);
    }
};

watch([() => route.query.chapter, () => route.query.book], async () => {
    if (loggedIn.value) {
        await loadNotes();
        await loadBookmarks();
    }
});

watch(() => selectedChapterVerses.value?.version, async () => {
    if (loggedIn.value && user.value?.preferences?.notesPerVersion) {
        await loadNotes();
    }
    if (loggedIn.value && user.value?.preferences?.bookmarksPerVersion) {
        await loadBookmarks();
    }
});

defineOgImageComponent('Saas');
</script>

<template>
    <ClientOnly>
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
                v-if="selectedChapterVerses"
                :title="`${selectedChapterVerses.book.name} ${selectedChapterVerses.chapter}`"
                :description="selectedChapterVerses.version.name"
            />

            <UPageBody>
                <div>
                    <BibleReader
                        v-if="selectedChapterVerses"
                        :verses-data="selectedChapterVerses"
                        :versions="availableVersions || []"
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
    </ClientOnly>
</template>

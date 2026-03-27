<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';
import type {
    AuthenticatedUserData,
    BibleBookData,
    BibleBookmarkWithVersePreview,
    BibleNoteWithVersePreview,
    BibleVerseResponseData,
    BibleVersionData
} from '~/types';

definePageMeta({
    layout: 'bible'
});
const route = useRoute();
const user = useSanctumUser<AuthenticatedUserData>();
const { isAuthenticated: loggedIn } = useSanctumAuth();
const { data: booksData } = await useAsyncData('bible-books', () => $fetch<{ data: { all: BibleBookData[]; grouped: { old: BibleBookData[]; new: BibleBookData[]; }; }; }>('/api/bible/books'), { transform: data => data?.data || [] });
const { data: availableVersions } = await useAsyncData('bible-versions', () => $fetch<{ data: BibleVersionData[]; }>('/api/bible/versions'), { transform: data => data?.data || [] });
const { data: selectedChapterVerses } = await useAsyncData(
    'bible-verses',
    () => $fetch<{ data: BibleVerseResponseData; }>(`/api/bible/verses/${route.query.book || 'GEN'}/${route.query.chapter || '1'}`, {
        query: {
            version: route.query.version || user.value?.preferences?.resolvedPreferredVersion?.code || 'LSG'
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
    get: () => route.query.version as string || user.value?.preferences?.resolvedPreferredVersion?.code || 'LSG',
    set: (value: string | undefined) => {
        router.push({ query: { ...route.query, version: value } });
    }
});
const books = computed<BibleBookData[]>(() => booksData.value?.all || []);
const notes = ref<BibleNoteWithVersePreview[]>([]);
const bookmarks = ref<BibleBookmarkWithVersePreview[]>([]);
const { fetchNotes } = useBibleNotes();
const { fetchBookmarks } = useBookmarks();
const { fetchPreferences } = useUserPreferences();

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

const updateChapter = async (chapterId: number) => {
    await router.push({ query: { ...route.query, chapter: chapterId } });
};

useSeoMeta({
    title: 'Lire la Bible en ligne - Théologie Vivante',
    ogTitle: 'Lire la Bible en ligne - Théologie Vivante',
    description: 'Lisez la Bible en ligne avec différentes versions disponibles. Parcourez les livres et chapitres de la Bible facilement.',
    ogDescription: 'Lisez la Bible en ligne avec différentes versions disponibles. Parcourez les livres et chapitres de la Bible facilement.'
});

onMounted(async () => {
    if (loggedIn.value) {
        await fetchPreferences();
        await loadNotes();
        await loadBookmarks();
    }
});

const loadNotes = async () => {
    if (!selectedVersionCode.value || !selectedBookCode.value || !selectedChapter.value) return;

    try {
        const response = await fetchNotes({
            book: selectedBookCode.value,
            chapter: selectedChapter.value,
            version: selectedVersionCode.value
        });

        notes.value = response.notes || [];
    } catch (error) {
        console.error('Erreur lors du chargement des notes:', error);
    }
};

const loadBookmarks = async () => {
    if (!selectedVersion.value || !selectedBookCode.value || !selectedChapter.value) return;

    try {
        const response = await fetchBookmarks({
            book: selectedBookCode.value,
            chapter: selectedChapter.value,
            version: selectedVersionCode.value
        });
        bookmarks.value = response.bookmarks || [];
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

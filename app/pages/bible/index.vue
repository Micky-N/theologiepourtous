<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';
import type { $Enums, BibleBook, BibleVersion } from '@prisma/client';

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

definePageMeta({
    layout: 'bible'
});

const router = useRouter();
const route = useRoute();
const loadingBooks = ref(false);
const error = ref<string | null>(null);
const selectedBookCode = ref<string>('GEN');
const selectedChapter = ref<number | null>(1);
const selectedChapterVerses = ref<ApiVerseResponseData | null>(null);
const availableVersions = ref<BibleVersion[]>([]);
const selectedVersionCode = ref<string>('LSG');

const initQuery = () => {
    selectedBookCode.value = route.query.book as string | undefined || 'GEN';
    selectedVersionCode.value = route.query.version as string | undefined || 'LSG';
    selectedChapter.value = parseInt(route.query.chapter as string | undefined || '1');
};
// Données
const books = ref<BibleBook[]>([]);

const booksNavigation = computed<NavigationMenuItem[]>(() => {
    const oldTestamentBooks = books.value.filter(book => book.testament === 'OLD');
    const newTestamentBooks = books.value.filter(book => book.testament === 'NEW');
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
    return availableVersions.value.map(version => ({
        label: version.name,
        to: router.resolve({ query: { ...route.query, version: version.code } }).href,
        active: selectedVersionCode.value === version.code
    }));
});

const selectedBook = computed(() => {
    return books.value.find(book => book.code == selectedBookCode.value);
});

const selectedVersion = computed(() => {
    return availableVersions.value.find(version => version.code == selectedVersionCode.value);
});

const updateBook = async (bookCode: string) => {
    await router.push({ query: { ...route.query, book: bookCode, chapter: 1 } });
};

const updateChapter = async (chapterId: number) => {
    await router.push({ query: { ...route.query, chapter: chapterId } });
};

useSeoMeta({
    title: 'Lire la Bible en ligne - Théologie Pour Tous',
    ogTitle: 'Lire la Bible en ligne - Théologie Pour Tous',
    description: 'Lisez la Bible en ligne avec différentes versions disponibles. Parcourez les livres et chapitres de la Bible facilement.',
    ogDescription: 'Lisez la Bible en ligne avec différentes versions disponibles. Parcourez les livres et chapitres de la Bible facilement.'
});

onMounted(async () => {
    initQuery();
    await Promise.all([
        loadBooks(),
        loadVersions(),
        loadVerses()
    ]);
});

const loadBooks = async () => {
    try {
        loadingBooks.value = true;
        const response = await $fetch('/api/bible/books');
        books.value = (response.data?.all) as unknown as BibleBook[];
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

const loadVerses = async () => {
    try {
        const response = await $fetch(`/api/bible/verses/${selectedBookCode.value}/${selectedChapter.value}`, {
            query: {
                version: selectedVersionCode.value
            }
        });
        selectedChapterVerses.value = response.data;
    } catch (err) {
        error.value = 'Erreur lors du chargement des versets';
        console.error(err);
    }
};

watch(() => route.query, async () => {
    initQuery();
    await loadVerses();
}, {
    deep: true
});

defineOgImageComponent('Saas');
</script>

<template>
    <UPage v-if="books.length && availableVersions.length">
        <template #left>
            <UPageAside>
                <template #top>
                    Les livres
                </template>

                <UNavigationMenu
                    :items="booksNavigation"
                    highlight
                    orientation="vertical"
                />
            </UPageAside>
        </template>
        <UPageHeader
            v-if="selectedBook && selectedChapter"
            :title="`${selectedBook.name} ${selectedChapter}`"
            :description="selectedVersion ? selectedVersion.name : 'Aucune version sélectionnée'"
        />

        <UPageBody>
            <div>
                <BibleReader
                    v-if="selectedBook && selectedChapter && selectedVersion &&selectedChapterVerses"
                    :book="selectedBook"
                    :chapter="selectedChapter"
                    :verses-data="selectedChapterVerses"
                    :versions="availableVersions"
                    :selected-version="selectedVersion"
                    @update:chapter="updateChapter"
                />
            </div>
            <USeparator />
        </UPageBody>

        <template
            v-if="availableVersions.length"
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

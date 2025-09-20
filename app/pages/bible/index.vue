<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import type { $Enums, BibleBook, BibleVersion } from '@prisma/client'

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
})

const router = useRouter()
const loadingBooks = ref(false)
const error = ref<string | null>(null)
const selectedBook = ref<BibleBook | null>(null)
const selectedChapter = ref<number | null>(null)
const selectedChapterVerses = ref<ApiVerseResponseData | null>(null)
const availableVersions = ref<BibleVersion[]>([])
const selectedVersion = ref<BibleVersion | null>(null)

// Données
const books = ref<BibleBook[]>([])

const booksNavigation = computed<ContentNavigationItem[]>(() => {
    return [
        {
            title: 'Ancien Testament',
            path: '/bible',
            children: books.value.filter(book => book.testament === 'OLD').map(book => ({
                title: book.name,
                path: router.resolve({ query: { book: book.code } }).href,
                active: false
            }))
        },
        {
            title: 'Nouveau Testament',
            path: '/bible',
            children: books.value.filter(book => book.testament === 'NEW').map(book => ({
                title: book.name,
                path: router.resolve({ query: { book: book.code } }).href,
                active: false
            }))
        }
    ]
})

const availableVersionsNavigation = computed<ContentNavigationItem[]>(() => {
    return availableVersions.value.map(version => ({
        title: version.name,
        path: router.resolve({ query: { version: version.code } }).href,
        active: false
    }))
})

const updateBook = async (bookId: number) => {
    selectedBook.value = books.value.find(book => book.id === bookId) || null
    selectedChapter.value = 1
    await getVerses()
}

const updateChapter = async (chapterId: number) => {
    selectedChapter.value = chapterId
    await getVerses()
}

const updateVersion = async (versionId: number) => {
    selectedVersion.value = availableVersions.value.find(version => version.id === versionId) || null
    await getVerses()
}

useSeoMeta({
    title: '',
    ogTitle: '',
    description: '',
    ogDescription: ''
})

onMounted(async () => {
    await Promise.all([
        loadBooks(),
        loadVersions()
    ])

    if (books.value.length > 0) {
        selectedBook.value = books.value[0] || null
        selectedChapter.value = 1
    }

    if (availableVersions.value.length > 0) {
        selectedVersion.value = availableVersions.value[0] || null
    }

    if (selectedBook.value && selectedChapter.value) {
        await getVerses()
    }
})

const loadBooks = async () => {
    try {
        loadingBooks.value = true
        const response = await $fetch('/api/bible/books')
        books.value = (response.data?.all) as unknown as BibleBook[]
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

const getVerses = async () => {
    try {
        const response = await $fetch(`/api/bible/verses/${selectedBook.value?.code}/${selectedChapter.value}`, {
            query: {
                version: selectedVersion.value?.code || 'LSG'
            }
        })
        selectedChapterVerses.value = response.data
    } catch (err) {
        error.value = 'Erreur lors du chargement des versets'
        console.error(err)
    }
}

defineOgImageComponent('Saas')
</script>

<template>
    <UPage v-if="books.length && availableVersions.length">
        <template #left>
            <UPageAside>
                <template #top>
                    <UContentSearchButton :collapsed="false" />
                </template>

                <UContentNavigation
                    :navigation="booksNavigation"
                    highlight
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
                    @update:book="updateBook"
                    @update:chapter="updateChapter"
                    @update:version="updateVersion"
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

                <UContentNavigation
                    :navigation="availableVersionsNavigation"
                    variant="link"
                />
            </UPageAside>
        </template>
    </UPage>
</template>

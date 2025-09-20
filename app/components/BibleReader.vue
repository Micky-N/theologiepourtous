<template>
    <div />
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
                </div>
            </template>
            <div>
                <span
                    v-for="verse in currentVerses"
                    :key="verse.id"
                >
                    <span class="font-bold text-primary-600 dark:text-primary-400">{{ verse.verse }}</span>
                    <span class="mr-1">{{ verse.text }}</span>
                </span>
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
    </div>
</template>

<script lang="ts" setup>
import type { $Enums, BibleBook, BibleVersion } from '@prisma/client'
import { computed } from 'vue'

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

const props = defineProps<{
    book: BibleBook
    chapter: number
    versesData: ApiVerseResponseData
    versions: BibleVersion[]
    selectedVersion: BibleVersion
}>()

const emit = defineEmits<{
    (e: 'update:chapter', value: number): void
}>()

const chapters = computed(() => {
    return Array.from({ length: props.versesData?.navigation.totalChapters || 0 }, (_, i) => i + 1)
})

const currentVerses = computed(() => props.versesData?.verses || [])

const handleChapterChange = (chapter: number) => {
    emit('update:chapter', chapter)
}
</script>

<style>

</style>

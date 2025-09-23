<template>
    <UContextMenu
        :items="items"
    >
        <span>
            <span class="inline-block align-top text-xs text-primary-600 dark:text-primary-400">
                {{ verse.verse }}
            </span>
            <UPopover
                v-model:open="openedBookmarkForm"
                :content="{
                    sideOffset: 0
                }"
                arrow
            >
                <template #anchor>
                    <span :class="{ underline: openedBookmarkForm }">{{ verse.text }}</span>
                </template>
                <template #content>
                    <BookmarkFormPopover
                        :verse-id="verse.id"
                        @close-form="openedBookmarkForm = false"
                    />
                </template>
            </UPopover>
        </span>
    </UContextMenu>
</template>

<script lang="ts" setup>
import type { ContextMenuItem } from '@nuxt/ui';

const props = defineProps<{
    verse: {
        text: string
        chapter: number
        id: number
        verse: number
    }
}>();

const emit = defineEmits<{
    (e: 'showCompare' | 'addNote', verseId: number): void
}>();

const openedBookmarkForm = ref(false);

const items: ContextMenuItem[][] = [
    [
        {
            label: 'Comparer',
            icon: 'i-lucide-eye',
            onSelect: () => emit('showCompare', props.verse.verse),
            ui: {
                item: 'cursor-pointer'
            }
        },
        {
            label: 'Marquer',
            icon: 'i-lucide-bookmark',
            onSelect: () => openedBookmarkForm.value = true,
            ui: {
                item: 'cursor-pointer'
            }
        },
        {
            label: 'Ajouter Note',
            icon: 'i-lucide-notebook-pen',
            onSelect: () => emit('addNote', props.verse.verse),
            ui: {
                item: 'cursor-pointer'
            }
        }
    ]
];
</script>

<style>

</style>

<template>
    <UContextMenu
        :items="items"
    >
        <span>
            <button class="cursor-pointer mr-0.5">
                <UIcon
                    name="i-lucide-notebook-pen"
                    class="size-3 text-warning-500 dark:text-warning-400"
                />
            </button>
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
                    <span
                        :class="{
                            underline: openedBookmarkForm
                        }"
                        :style="`text-decoration-color: var(--color-${'green'}-500)`"
                    >
                        {{ verse.text }}
                    </span>
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

const { loggedIn } = useUserSession();

const items = computed<ContextMenuItem[]>(() => {
    const baseItems = [{
        label: 'Comparer',
        icon: 'i-lucide-eye',
        onSelect: () => emit('showCompare', props.verse.verse),
        ui: {
            item: 'cursor-pointer'
        }
    }];
    if (loggedIn.value) {
        baseItems.push({
            label: 'Marquer',
            icon: 'i-lucide-bookmark',
            onSelect: () => openedBookmarkForm.value = true,
            ui: {
                item: 'cursor-pointer'
            }
        });
        baseItems.push({
            label: 'Ajouter Note',
            icon: 'i-lucide-notebook-pen',
            onSelect: () => emit('addNote', props.verse.verse),
            ui: {
                item: 'cursor-pointer'
            }
        });
    }
    return baseItems;
});
</script>

<style>

</style>

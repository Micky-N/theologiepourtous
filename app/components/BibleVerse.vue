<template>
    <UContextMenu
        :items="items"
    >
        <span>
            <span class="font-bold text-primary-600 dark:text-primary-400">
                {{ verse.verse }}
            </span>
            <span>{{ verse.text }}</span>
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
    (e: 'showCompare', id: number): void
}>();

const items: ContextMenuItem[][] = [
    [
        {
            label: 'Comparer',
            icon: 'i-lucide-eye',
            onSelect: () => emit('showCompare', props.verse.verse),
            slot: 'compare' as const
        },
        {
            label: 'Edit',
            icon: 'i-lucide-pencil'
        },
        {
            label: 'Copier',
            icon: 'i-lucide-copy'
        }
    ]
];
</script>

<style>

</style>

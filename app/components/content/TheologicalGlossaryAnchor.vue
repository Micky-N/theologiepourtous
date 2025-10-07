<template>
    <a
        :id="term"
        class="cursor-help text-primary-600 border-b border-dotted border-primary-600 dark:text-primary-400 dark:border-primary-400"
        @click.prevent="openGlossary(term)"
    >
        <slot />
    </a>
</template>

<script setup lang="ts">
const { term } = defineProps<{
    term: string;
}>();

defineEmits<{
    (e: 'open-glossary', term: string): void;
}>();

const openGlossary = (term: string) => {
    // Emit an event to open the glossary modal with the specified term
    window.dispatchEvent(new CustomEvent('open-glossary', { detail: term }));
};
</script>

<template>
    <a
        :id="term"
        class="cursor-pointer text-primary-600 hover:underline"
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
    console.log(term);
    // Emit an event to open the glossary modal with the specified term
    window.dispatchEvent(new CustomEvent('open-glossary', { detail: term }));
};
</script>

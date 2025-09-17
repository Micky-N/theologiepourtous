<template>
    <UModal
        v-model:open="isOpen"
        :close="{ onClick: () => emit('close') }"
        :title="term"
        description="Terme théologique"
        :ui="{
            description: 'hidden',
            content: 'max-w-2xl'
        }"
    >
        <template #body>
            <div class="space-y-3">
                <p>{{ definition }}</p>
                <div
                    v-if="etymology"
                    class="text-sm bg-blue-50 p-3 rounded"
                >
                    <strong>Étymologie :</strong> {{ etymology }}
                </div>
                <div
                    v-if="relatedTerms.length"
                    class="text-sm"
                >
                    <strong>Termes liés :</strong>
                    <div class="flex flex-wrap gap-2 mt-1">
                        <UBadge
                            v-for="relatedTerm in relatedTerms"
                            :key="relatedTerm"
                            variant="soft"
                        >
                            {{ relatedTerm }}
                        </UBadge>
                    </div>
                </div>
            </div>
        </template>
    </UModal>
</template>

<script setup lang="ts">
const { id, term, definition, etymology, relatedTerms = [] } = defineProps<{
    id: string
    term: string
    definition: string
    etymology?: string
    relatedTerms?: string[]
}>()

const isOpen = ref(false)
const emit = defineEmits<{
    (e: 'close'): void
}>()

onMounted(() => {
    const openHandler = (event: CustomEvent) => {
        if (event.detail === id) {
            isOpen.value = true
        }
    }
    window.addEventListener('open-glossary', openHandler as EventListener)
})
// Clean up the event listener when the component is unmounted
onUnmounted(() => {
    window.removeEventListener('open-glossary', () => {})
})
</script>

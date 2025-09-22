<template>
    <UCard class="biblical-reference border-l-4 border-l-primary-500">
        <div class="flex items-start gap-3">
            <UIcon
                name="i-heroicons-book-open"
                class="text-primary-500 mt-1"
            />
            <div class="flex-1">
                <div class="font-medium text-primary-700 mb-1">
                    {{ reference }}
                </div>
                <div class="italic text-gray-700 leading-relaxed">
                    {{ text }}
                </div>
                <div
                    v-if="commentary"
                    class="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded"
                >
                    💡 {{ commentary }}
                </div>
            </div>
        </div>
    </UCard>
</template>

<script setup lang="ts">
defineProps<{
    reference: string
    text: string
    commentary?: string
}>();
</script>

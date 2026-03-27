<template>
    <UCard class="biblical-reference border-l-2 border-l-primary-500">
        <div class="flex items-start gap-3">
            <UIcon
                name="i-heroicons-book-open"
                class="text-primary-500 mt-1"
            />
            <div class="flex-1">
                <div class="font-medium text-primary-700 dark:text-primary-400 mb-1">
                    {{ reference }}
                </div>
                <div class="italic text-gray-700 dark:text-gray-300 leading-relaxed">
                    {{ text }}
                </div>
                <div
                    v-if="commentary"
                    class="mt-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded"
                >
                    💡 {{ commentary }}
                </div>
            </div>
        </div>
    </UCard>
</template>

<script setup lang="ts">
defineProps<{
    reference: string;
    text: string;
    commentary?: string;
}>();
</script>

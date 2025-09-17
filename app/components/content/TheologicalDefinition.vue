<template>
    <UCard class="theological-definition mb-6">
        <template #header>
            <div class="flex items-center gap-2">
                <UIcon
                    name="i-heroicons-book-open"
                    class="text-primary-500"
                />
                <h3 class="text-lg font-semibold">
                    Définition
                </h3>
            </div>
        </template>

        <div class="space-y-3">
            <div class="text-gray-700">
                {{ definition }}
            </div>

            <div
                v-if="etymology"
                class="text-sm bg-gray-50 p-3 rounded"
            >
                <strong>Étymologie :</strong> {{ etymology }}
            </div>
        </div>
    </UCard>
</template>

<script setup lang="ts">
defineProps<{
    definition: string
    etymology?: string
}>()
</script>

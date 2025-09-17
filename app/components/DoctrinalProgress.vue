<template>
    <UCard class="doctrinal-progress">
        <template #header>
            <h3 class="text-lg font-semibold">
                Progression dans l'étude
            </h3>
        </template>

        <div class="space-y-3">
            <div
                v-for="(step, index) in steps"
                :key="index"
                class="flex items-center gap-3"
            >
                <div
                    class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                    :class="step.completed ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600'"
                >
                    {{ index + 1 }}
                </div>
                <div class="flex-1">
                    <div
                        class="font-medium"
                        :class="step.completed ? 'text-primary-700' : 'text-gray-700'"
                    >
                        {{ step.title }}
                    </div>
                    <div class="text-sm text-gray-600">
                        {{ step.description }}
                    </div>
                </div>
                <UIcon
                    v-if="step.completed"
                    name="i-heroicons-check-circle"
                    class="text-primary-500"
                />
            </div>
        </div>
    </UCard>
</template>

<script setup lang="ts">
defineProps<{
    steps: {
        title: string
        description: string
        completed: boolean
    }[]
}>()
</script>

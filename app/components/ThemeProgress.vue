<template>
    <UCard class="doctrinal-progress">
        <template #header>
            <h3 class="text-lg font-semibold">
                Progression dans l'étude
            </h3>
            <UProgress
                v-model="percent"
                :max="lessons.length"
                :color="percent == lessons.length ? 'success' : 'secondary'"
                :ui="{
                    root: 'mt-2'
                }"
            />
        </template>

        <div class="space-y-3">
            <div
                v-for="(lesson, index) in lessons"
                :key="index"
                class="flex items-center gap-3"
            >
                <div
                    class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                    :class="lesson.completed ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600'"
                >
                    {{ index + 1 }}
                </div>
                <div class="flex-1">
                    <div
                        class="font-medium"
                        :class="lesson.completed ? 'text-primary-700' : 'text-gray-700'"
                    >
                        {{ lesson.title }}
                    </div>
                    <div class="text-sm text-gray-600">
                        {{ lesson.description }}
                    </div>
                </div>
                <UIcon
                    v-if="lesson.completed"
                    name="i-heroicons-check-circle"
                    class="text-primary-500 min-w-5"
                />
            </div>
        </div>
    </UCard>
</template>

<script setup lang="ts">
const { lessons } = defineProps<{
    lessons: {
        title: string
        description: string
        completed: boolean
    }[]
}>();

const percent = computed(() => lessons.filter(lesson => lesson.completed).length);
</script>

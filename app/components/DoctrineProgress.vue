<template>
    <div class="doctrine-tracker">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <UCard
                v-for="doctrine in doctrines"
                :key="doctrine.slug"
            >
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <h3 class="font-semibold">
                            {{ doctrine.title }}
                        </h3>
                        <UBadge :color="getProgressColor(doctrine.progress)">
                            {{ doctrine.progress }}%
                        </UBadge>
                    </div>
                    <UProgress :value="doctrine.progress" />
                    <div class="text-sm text-gray-600">
                        {{ doctrine.completedArticles }} / {{ doctrine.totalArticles }} articles
                    </div>
                </div>
            </UCard>
        </div>
    </div>
</template>

<script setup lang="ts">
const { doctrines } = defineProps<{
    doctrines: {
        slug: string
        title: string
        progress: number
        completedArticles: number
        totalArticles: number
    }[]
}>();

const getProgressColor = (progress: number) => {
    if (progress === 100) return 'success';
    if (progress >= 50) return 'warning';
    return 'error';
};
</script>

<template>
    <UCard>
        <template #header>
            <div class="flex items-center gap-2">
                <UIcon
                    :name="icon"
                    :class="iconColorClass"
                    class="w-5 h-5"
                />
                <div>
                    <h3 class="font-medium text-gray-900 dark:text-white">
                        {{ title }}
                    </h3>
                </div>
            </div>
        </template>

        <div class="text-center">
            <div
                class="text-3xl font-bold"
                :class="valueColorClass"
            >
                {{ value }}
            </div>
            <div
                v-if="subtitle"
                class="text-sm text-gray-500 dark:text-gray-400 mt-1"
            >
                {{ subtitle }}
            </div>
        </div>
    </UCard>
</template>

<script setup lang="ts">
interface Props {
    title: string;
    value: string;
    icon: string;
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
    subtitle?: string;
}

const props = withDefaults(defineProps<Props>(), {
    color: 'blue',
    subtitle: ''
});

const iconColorClass = computed(() => {
    switch (props.color) {
        case 'green':
            return 'text-green-600 dark:text-green-400';
        case 'purple':
            return 'text-purple-600 dark:text-purple-400';
        case 'orange':
            return 'text-orange-600 dark:text-orange-400';
        case 'red':
            return 'text-red-600 dark:text-red-400';
        default:
            return 'text-blue-600 dark:text-blue-400';
    }
});

const valueColorClass = computed(() => {
    switch (props.color) {
        case 'green':
            return 'text-green-700 dark:text-green-300';
        case 'purple':
            return 'text-purple-700 dark:text-purple-300';
        case 'orange':
            return 'text-orange-700 dark:text-orange-300';
        case 'red':
            return 'text-red-700 dark:text-red-300';
        default:
            return 'text-blue-700 dark:text-blue-300';
    }
});
</script>

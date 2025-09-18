<script setup lang="ts">
const props = withDefaults(defineProps<{
    orientation?: 'horizontal' | 'vertical'
}>(), {
    orientation: 'horizontal'
})

const slots = useSlots()

const countChildren = computed(() => slots.default ? slots.default().length : 0)

const gridClasses = computed(() => {
    if (props.orientation === 'horizontal') {
        /**
         * If counter is 1, we use 1 column
         * If counter is 2, we use 2 columns md, 1 column sm
         * If counter is 3, we use 3 columns lg, 2 columns md, 1 column sm
         */
        if (countChildren.value === 1) {
            return 'grid-cols-1 gap-4'
        } else if (countChildren.value === 2) {
            return 'grid-cols-1 sm:grid-cols-2 gap-4'
        } else if (countChildren.value >= 3) {
            return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'
        }
        return 'grid-cols-1 gap-4'
    } else {
        return 'grid-cols-1 gap-4'
    }
})
</script>

<template>
    <div
        class="grid"
        :class="gridClasses"
    >
        <slot mdc-unwrap="p" />
    </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  orientation?: 'horizontal' | 'vertical'
}>(), {
  orientation: 'horizontal'
})
</script>

<template>
  <div
    class="flex items-center justify-between"
    :class="orientation === 'vertical' ? 'flex-col space-y-4' : 'flex-row   space-x-4'"
  >
    <slot />
  </div>
</template>

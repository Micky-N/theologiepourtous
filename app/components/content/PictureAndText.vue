<script setup lang="ts">
import { UPageCard } from '#components';

defineProps<{
    reverse?: boolean
    card?: boolean
}>();
</script>

<template>
    <component
        :is="card ? UPageCard : 'div'"
        class="my-8"
        orientation="horizontal"
        :reverse="reverse"
    >
        <template
            v-if="card"
            #default
        >
            <slot
                mdc-unwrap="p"
                name="image"
            />
        </template>
        <div
            v-if="!card"
            class="grid md:grid-cols-3 items-center w-full gap-8"
        >
            <div
                class="w-full"
                :class="{ 'order-2': reverse }"
            >
                <slot
                    mdc-unwrap="p"
                    name="image"
                />
            </div>
            <div class="md:col-span-2">
                <slot mdc-unwrap="p" />
            </div>
        </div>
        <template
            v-if="card"
            #body
        >
            <slot />
        </template>
    </component>
</template>

<template>
    <UCard class="theological-comparison">
        <template #header>
            <h3 class="text-lg font-semibold">
                {{ title }}
            </h3>
            <p class="text-sm text-gray-500 mt-1">
                {{ subtitle }}
            </p>
        </template>

        <div class="overflow-x-auto">
            <table class="w-full border-collapse">
                <thead>
                    <tr class="bg-gray-50 border-b">
                        <th class="text-left p-3 font-semibold text-gray-700">
                            Position
                        </th>
                        <th class="text-left p-3 font-semibold text-gray-700">
                            Arguments principaux
                        </th>
                        <th
                            v-if="withVerse"
                            class="text-left p-3 font-semibold text-gray-700"
                        >
                            Versets clés
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="position in positions"
                        :key="position.name"
                        class="border-b hover:bg-gray-50 transition"
                    >
                        <td class="p-3 font-medium text-primary-700">
                            {{ position.name }}
                        </td>
                        <td class="p-3 text-gray-700">
                            {{ position.arguments }}
                        </td>
                        <td
                            v-if="withVerse"
                            class="p-3"
                        >
                            <UBadge
                                v-for="verse in position.verses"
                                :key="verse"
                                variant="soft"
                                color="info"
                                class="mr-1 mb-1"
                            >
                                <BiblicalReferencePopover :verse="verse">
                                    {{ verse }}
                                </BiblicalReferencePopover>
                            </UBadge>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </UCard>
</template>

<script setup lang="ts">
import BiblicalReferencePopover from './BiblicalReferencePopover.vue';

withDefaults(defineProps<{
    withVerse?: boolean;
    title?: string;
    subtitle?: string;
    positions: {
        name: string;
        arguments: string;
        verses: string[];
    }[];
}>(), {
    withVerse: true,
    title: 'Perspectives théologiques',
    subtitle: 'Comparez les différentes positions doctrinales sur un sujet biblique.'
});
</script>

<style scoped>
.theological-comparison {
  margin-top: 2rem;
}
</style>

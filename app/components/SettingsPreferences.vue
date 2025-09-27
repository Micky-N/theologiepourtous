<script setup lang="ts">
import type { UserPreference } from '@prisma/client';
import * as z from 'zod';

const { preferences, updatePreferences, fetchPreferences } = useUserPreferences();
const { versions, fetchVersions } = useBibleVersions();

await fetchPreferences();
await fetchVersions();

const preferencesSchema = z.object({
    defaultVersionId: z.number().nullable(),
    notesPerVersion: z.boolean(),
    bookmarksPerVersion: z.boolean()
});

const state = reactive<Pick<UserPreference, 'defaultVersionId' | 'notesPerVersion' | 'bookmarksPerVersion'>>({
    defaultVersionId: preferences.value.defaultVersionId,
    notesPerVersion: preferences.value.notesPerVersion,
    bookmarksPerVersion: preferences.value.bookmarksPerVersion
});

const fields = [
    {
        name: 'defaultVersionId',
        label: 'Version par défaut',
        description: 'Version de la bible préférée',
        items: versions.value
    },
    {
        name: 'notesPerVersion',
        label: 'Notes par version',
        description: 'Afficher les notes par version'
    },
    {
        name: 'bookmarksPerVersion',
        label: 'Signets par version',
        description: 'Afficher les signets par version'
    }
];
</script>

<template>
    <UForm
        id="preferences"
        :schema="preferencesSchema"
        :state="state"
        @submit="({ data }) => updatePreferences(data)"
    >
        <UPageCard variant="subtle">
            <UFormField
                v-for="field in fields"
                :key="field.name"
                :name="field.name"
                :label="field.label"
                :description="field.description"
                class="flex items-center justify-between not-last:pb-4 gap-2"
            >
                <USwitch
                    v-if="field.name == 'notesPerVersion' || field.name == 'bookmarksPerVersion'"
                    v-model="state[field.name]"
                />
            </UFormField>
        </UPageCard>
        <UButton
            form="settings"
            label="Save changes"
            color="neutral"
            type="submit"
            class="w-fit lg:ms-auto mt-4"
        />
    </UForm>
</template>

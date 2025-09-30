<script setup lang="ts">
import type { UserPreference } from '@prisma/client';
import * as z from 'zod';

const { preferences, updatePreferences, fetchPreferences } = useUserPreferences();
const { versions, fetchVersions } = useBibleVersions();
const toast = useToast();

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

const versionsItems = computed(() => {
    const items: { id: number | null, name: string }[] = versions.value.map(v => ({
        id: v.id,
        name: `${v.name} (${v.code})`
    }));
    items.unshift({ id: null, name: 'Aucune' });
    return items;
});

const onSubmit = async () => {
    try {
        await updatePreferences(state);
        await fetchPreferences();
        toast.add({
            title: 'Succès',
            description: 'Préférences mises à jour',
            icon: 'i-lucide-check',
            color: 'success'
        });
    } catch (e) {
        toast.add({
            title: 'Erreur',
            description: (e as Error).message || 'Une erreur est survenue',
            icon: 'i-lucide-x-circle',
            color: 'error'
        });
    }
};

const fields = [
    {
        name: 'defaultVersionId',
        label: 'Version par défaut',
        description: 'Version de la bible préférée',
        items: versionsItems.value
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
        @submit="onSubmit"
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

                <USelect
                    v-if="field.name == 'defaultVersionId' && field.items"
                    v-model="state[field.name]"
                    :items="field.items"
                    label-key="name"
                    value-key="id"
                    placeholder="Sélectionner une version"
                    class="min-w-52"
                />
            </UFormField>
        </UPageCard>
        <UButton
            form="preferences"
            label="Enregistrer les préférences"
            color="neutral"
            type="submit"
            class="w-fit lg:ms-auto mt-4"
        />
    </UForm>
</template>

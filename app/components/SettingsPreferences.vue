<script setup lang="ts">
import type { UserPreferencesData } from '~/types';
import * as z from 'zod';

const { preferences, updatePreferences, fetchPreferences } = useUserPreferences();
const { versions, fetchVersions } = useBibleVersions();
const toast = useToast();

await fetchPreferences();
await fetchVersions();

const preferencesSchema = z.object({
    preferred_version: z.string().nullable(),
    theme: z.enum(['light', 'dark', 'system'])
});

const state = reactive<Pick<UserPreferencesData, 'preferred_version' | 'theme'>>({
    preferred_version: preferences.value.preferred_version ?? 'LSG',
    theme: preferences.value.theme
});

const versionsItems = computed(() => versions.value.map(v => ({
    id: v.code,
    name: `${v.name} (${v.code})`
})));

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
        name: 'preferred_version',
        label: 'Version par défaut',
        description: 'Version de la bible préférée',
        items: versionsItems.value
    },
    {
        name: 'theme',
        label: 'Thème',
        description: 'Sélectionner le thème de l\'application',
        items: [
            { id: 'light', name: 'Clair' },
            { id: 'dark', name: 'Sombre' },
            { id: 'system', name: 'Système' }
        ]
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
                <USelect
                    v-if="field.name == 'preferred_version' && field.items"
                    v-model="state[field.name]"
                    :items="field.items"
                    label-key="name"
                    value-key="id"
                    placeholder="Sélectionner une version"
                    class="min-w-52"
                />
                <USelect
                    v-else-if="field.name == 'theme' && field.items"
                    v-model="state[field.name]"
                    :items="field.items"
                    label-key="name"
                    value-key="id"
                    placeholder="Sélectionner un thème"
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

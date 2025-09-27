<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui';

definePageMeta({
    middleware: 'auth'
});

const mode = ref<'general' | 'preferences'>('general');

const navigations: NavigationMenuItem[] = [
    {
        label: 'Général',
        onSelect: () => mode.value = 'general'
    },
    {
        label: 'Préférences',
        onSelect: () => mode.value = 'preferences'
    }
];

useHead({
    title: 'Paramètres',
    meta: [
        { name: 'robots', content: 'noindex,nofollow' },
        { name: 'description', content: 'Modifier les paramètres de votre compte' }
    ]
});
</script>

<template>
    <UMain>
        <UContainer>
            <UPage>
                <template #left>
                    <UPageAside>
                        <template #top>
                            Paramètres
                        </template>

                        <UNavigationMenu
                            :items="navigations"
                            highlight
                            orientation="vertical"
                        />
                    </UPageAside>
                </template>
                <UPageHeader
                    :title="mode == 'general' ? 'Profil' : 'Préférences'"
                    :description="mode == 'general' ? 'Modifier les informations de votre profil' : 'Modifier vos préférences utilisateur'"
                />

                <UPageBody>
                    <SettingsGeneral v-if="mode == 'general'" />
                    <SettingsPreferences v-if="mode == 'preferences'" />
                </UPageBody>
            </UPage>
        </UContainer>
    </UMain>
</template>

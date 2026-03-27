<script setup lang="ts">
import type { AuthenticatedUserData } from '~/types';

const colorMode = useColorMode();
const user = useSanctumUser<AuthenticatedUserData>();

const color = computed(() => colorMode.value === 'dark' ? '#020618' : 'white');

watch(
    () => user.value?.preferences?.theme,
    (theme) => {
        if (!theme || colorMode.preference === theme) {
            return;
        }

        colorMode.preference = theme;
    },
    { immediate: true }
);

useHead({
    meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { key: 'theme-color', name: 'theme-color', content: color }
    ],
    link: [
        { rel: 'icon', href: '/favicon.ico' }
    ],
    htmlAttrs: {
        lang: 'fr'
    }
});

useSeoMeta({
    titleTemplate: '%s - Théologie Vivante',
    ogImage: 'https://ui4.nuxt.com/assets/templates/nuxt/saas-light.png',
    twitterImage: 'https://ui4.nuxt.com/assets/templates/nuxt/saas-light.png',
    twitterCard: 'summary_large_image'
});
</script>

<template>
    <UApp>
        <NuxtLoadingIndicator />

        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </UApp>
</template>

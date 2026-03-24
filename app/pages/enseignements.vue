<script setup lang="ts">
import { useTeachingsApi } from '~/composables/useTeachingsApi';
import type { TeachingThemeData } from '~/types';

const route = useRoute();
const { fetchThemes } = useTeachingsApi();
const { data: themes } = await useAsyncData('teaching-themes-navigation', () => fetchThemes());

const items = computed(() => {
    if (!themes.value) {
        return [];
    }

    return themes.value.map((theme: TeachingThemeData) => ({
        ...theme,
        image: theme.image_url || undefined,
        description: theme.excerpt || '',
        label: theme.title,
        to: theme.path,
        children: [],
        active: route.path === theme.path || route.path.startsWith(`${theme.path}/`)
    }));
});
</script>

<template>
    <div>
        <UHeader
            title="Thèmes"
            to="/enseignements"
            mode="slideover"
        >
            <ClientOnly>
                <UNavigationMenu
                    :items="items"
                    :ui="{
                        list: 'gap-10',
                        link: 'gap-0',
                        linkTrailingIcon: 'hidden size-0'
                    }"
                >
                    <template #item-content="{ item }">
                        <UBlogPost
                            :title="item.title"
                            :description="item.description.slice(0, 100) + (item.description.length > 100 ? '...' : '')"
                            :image="item.image"
                            :to="item.to"
                            orientation="horizontal"
                            variant="ghost"
                            :badge="(item.lessons_count || 0) + ' leçon' + ((item.lessons_count || 0) > 1 ? 's' : '')"
                            :ui="{
                                body: 'lg:pr-4'
                            }"
                        >
                            <template #header>
                                <img
                                    :src="item.image"
                                    class="size-full object-cover object-center"
                                >
                            </template>
                        </UBlogPost>
                    </template>
                </UNavigationMenu>
            </ClientOnly>
            <template #body>
                <ClientOnly>
                    <UNavigationMenu
                        variant="link"
                        :highlight="true"
                        :items="items"
                        orientation="vertical"
                        :ui="{
                            list: 'space-y-2'
                        }"
                    />
                </ClientOnly>
            </template>
        </UHeader>
        <NuxtPage :themes="themes || []" />
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'bible'
});

const route = useRoute();

const { data: page } = await useAsyncData(route.path, () => queryCollection('bible').path(route.path).first());
if (!page.value) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true });
}

const { data: surround } = await useAsyncData(`${route.path}-surround`, () => {
    return queryCollectionItemSurroundings('bible', route.path, {
        fields: ['description']
    });
});

const { data: navigation } = useAsyncData('navigation', () => queryCollectionNavigation('bible'), {
    transform: data => data.find(item => item.path === '/bible')?.children || []
});

const title = page.value.seo?.title || page.value.title;
const description = page.value.seo?.description || page.value.description;

useSeoMeta({
    title,
    ogTitle: title,
    description,
    ogDescription: description
});

defineOgImageComponent('Saas');
</script>

<template>
    <UPage v-if="page">
        <template #left>
            <UPageAside>
                <template #top>
                    <UContentSearchButton :collapsed="false" />
                </template>

                <UContentNavigation
                    :navigation="navigation"
                    highlight
                />
            </UPageAside>
        </template>
        <UPageHeader
            :title="page.title"
            :description="page.description"
        />

        <UPageBody>
            <ContentRenderer
                v-if="page.body"
                :value="page"
            />

            <USeparator v-if="surround?.length" />

            <UContentSurround :surround="surround" />
        </UPageBody>

        <template
            v-if="page?.body?.toc?.links?.length"
            #right
        >
            <UContentToc :links="page.body.toc.links" />
        </template>
    </UPage>
</template>

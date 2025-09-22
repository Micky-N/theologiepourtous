<script setup lang="ts">
const route = useRoute();
const { data: lesson } = await useAsyncData(route.path, () => queryCollection('lessons').path(route.path).first());
if (!lesson.value) {
    throw createError({ statusCode: 404, statusMessage: 'Lesson not found', fatal: true });
}

const { data: surround } = useAsyncData(`${route.path}-surround`, () => {
    return queryCollectionItemSurroundings('lessons', route.path, {
        fields: ['description']
    }).where('theme', '=', route.params.theme);
});

useSeoMeta({
    title: lesson.value.title,
    description: lesson.value.seo.description,
    keywords: lesson.value.seo.keywords,
    author: 'Théologie pour Tous',
    ogTitle: lesson.value.title,
    ogDescription: lesson.value.seo.description,
    ogImage: lesson.value.image.src,
    ogType: 'article',
    ogUrl: lesson.value.seo.url,
    twitterCard: lesson.value.seo.card,
    twitterTitle: lesson.value.title,
    twitterDescription: lesson.value.seo.description,
    twitterImage: lesson.value.image.src
});

useHead({
    htmlAttrs: {
        lang: lesson.value?.seo.lang || 'fr'
    },
    link: [
        { rel: 'canonical', href: lesson.value.seo.url }
    ]
});
</script>

<template>
    <UContainer v-if="lesson">
        <img
            :src="lesson.image.src"
            class="w-full aspect-video rounded-b-xl max-h-[32rem] object-cover object-center"
        >
        <UPageHeader
            :title="lesson.title"
            :description="lesson.description"
        >
            <template #headline>
                <div class="space-x-1">
                    <time class="text-muted">{{ new Date(lesson.date).toLocaleDateString('fr', { year: 'numeric', month: 'long', day: 'numeric' }) }}</time>
                    <span class="text-muted">&middot;</span>
                    <!-- tags -->
                    <span
                        v-for="tag in lesson.tags"
                        :key="tag"
                        class="text-warning-600 font-light"
                    >
                        {{ tag }}<span v-if="tag !== lesson.tags[lesson.tags.length - 1]">, </span>
                    </span>
                </div>
            </template>

            <div class="flex flex-col md:flex-row md:items-center gap-2 mt-4">
                <h3
                    v-if="lesson.biblical_references?.length"
                    class="text-sm font-medium text-muted"
                >
                    Références bibliques :
                </h3>
                <div class="flex flex-wrap items-center gap-2">
                    <!-- biblical reference -->
                    <UBadge
                        v-for="ref in lesson.biblical_references"
                        :key="ref"
                        :label="ref"
                        color="secondary"
                        variant="subtle"
                    />
                </div>
            </div>
        </UPageHeader>

        <UPage>
            <UPageBody>
                <ContentRenderer
                    v-if="lesson"
                    :value="lesson"
                />

                <USeparator v-if="surround?.length" />

                <UContentSurround :surround="surround" />
            </UPageBody>

            <template
                v-if="lesson?.body?.toc?.links?.length"
                #right
            >
                <UContentToc :links="lesson.body.toc.links" />
            </template>
        </UPage>
    </UContainer>
</template>

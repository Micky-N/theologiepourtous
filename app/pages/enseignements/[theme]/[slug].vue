<script setup lang="ts">
import type { LessonsCollectionItem, ThemesCollectionItem } from '@nuxt/content'

const route = useRoute()
const { themes } = defineProps<{ themes: ThemesCollectionItem[] }>()
const { data: lesson } = await useAsyncData(route.path, () => queryCollection('lessons').path(route.path).first())
if (!lesson.value) {
    throw createError({ statusCode: 404, statusMessage: 'Lesson not found', fatal: true })
}

const { data: surround } = useAsyncData(`${route.path}-surround`, () => {
    return queryCollectionItemSurroundings('lessons', route.path, {
        fields: ['description']
    })
})

useSeoMeta({
    title: lesson.value.title,
    description: lesson.value.seo.description,
    keywords: lesson.value.seo.keywords,
    author: lesson.value.author.name,
    ogTitle: lesson.value.title,
    ogDescription: lesson.value.seo.description,
    ogImage: lesson.value.image.src,
    ogType: 'article',
    ogUrl: lesson.value.seo.url,
    twitterCard: lesson.value.seo.card,
    twitterTitle: lesson.value.title,
    twitterDescription: lesson.value.seo.description,
    twitterImage: lesson.value.image.src
})

useHead({
    htmlAttrs: {
        lang: lesson.value?.seo.lang || 'fr'
    },
    link: [
        { rel: 'canonical', href: lesson.value.seo.url }
    ]
})

const getTheme = (lesson: LessonsCollectionItem) => {
    return themes.find(theme => theme.path === '/enseignements/' + lesson.theme)
}
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
                <UBadge
                    v-bind="{ label: getTheme(lesson)?.title, color: getTheme(lesson)?.color || 'primary' }"
                    variant="subtle"
                />
                <span class="text-muted">&middot;</span>
                <time class="text-muted">{{ new Date(lesson.date).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' }) }}</time>
            </template>

            <div class="flex flex-wrap items-center gap-3 mt-4">
                <UButton
                    :to="lesson.author.to"
                    color="neutral"
                    variant="subtle"
                    target="_blank"
                    size="sm"
                >
                    <UAvatar
                        v-bind="lesson.author.avatar"
                        alt="Author avatar"
                        size="sm"
                    />

                    {{ lesson.author.name }}
                </UButton>
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

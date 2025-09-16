<script setup lang="ts">
import type { LessonsCollectionItem, ThemesCollectionItem } from '@nuxt/content'

const { themes } = defineProps<{ themes: ThemesCollectionItem[] }>()

const route = useRoute()
const perPage = 7
const page = ref(parseInt((route.query.page as string) || '1'))
const { data: blog } = await useAsyncData('blog', () => queryCollection('teaching').first())
const { data: lessonsCount } = await useAsyncData('lessons-count', () => queryCollection('lessons').count())
const { data: lessons } = useAsyncData(
    route.path,
    () => queryCollection('lessons')
        .limit(perPage)
        .skip((page.value - 1) * perPage)
        .all(),
    { watch: [page] }
)

const totalPages = Math.ceil((lessonsCount.value || 0) / perPage)
if (page.value < 1 || (route.query.page && page.value === 1) || page.value > totalPages) {
    navigateTo('/enseignements')
}
const isFirstLessonOfFirstPage = (lesson: LessonsCollectionItem) => lesson.id === lessons.value?.[0]?.id && page.value === 1
const title = blog.value?.seo?.title || blog.value?.title
const description = blog.value?.seo?.description || blog.value?.description

useSeoMeta({
    title,
    ogTitle: title,
    description,
    ogDescription: description
})

const getTheme = (lesson: LessonsCollectionItem) => {
    return themes.find(theme => theme.path === '/enseignements/' + lesson.theme)
}

defineOgImageComponent('Saas')
</script>

<template>
    <UPage>
        <NuxtImg
            src="/images/hero-blog.webp"
            class="w-full aspect-video max-h-[32rem] object-cover object-center"
        />

        <UContainer>
            <UPageHeader
                v-bind="blog"
                class="py-[50px]"
            />

            <UPageBody>
                <UBlogPosts v-if="lessons">
                    <UBlogPost
                        v-for="(lesson, index) in lessons"
                        :key="index"
                        :to="lesson.path"
                        :title="lesson.title"
                        :description="lesson.description"
                        :image="lesson.image"
                        :date="new Date(lesson.date).toLocaleDateString('fr', { year: 'numeric', month: 'long', day: 'numeric' })"
                        :authors="[lesson.author]"
                        :badge="{ label: getTheme(lesson)?.title, color: getTheme(lesson)?.color || 'primary' }"
                        :orientation="isFirstLessonOfFirstPage(lesson) ? 'horizontal' : 'vertical'"
                        :class="[isFirstLessonOfFirstPage(lesson) && 'col-span-full']"
                        variant="naked"
                        :ui="{
                            description: 'line-clamp-2'
                        }"
                    />
                </UBlogPosts>
                <UPagination
                    v-if="totalPages > 1"
                    v-model:page="page"
                    :items-per-page="perPage"
                    show-edges
                    :total="lessonsCount"
                    :to="(p) => ({ path: '/enseignements', query: p > 1 ? { page: p } : {} })"
                    class="mt-10 flex justify-center"
                />
            </UPageBody>
        </UContainer>
    </UPage>
</template>

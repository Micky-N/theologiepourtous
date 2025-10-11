<script setup lang="ts">
import type { LessonsCollectionItem, ThemesCollectionItem } from '@nuxt/content';
import type { UserProgress } from '~~/src/database/models';

const { themes } = defineProps<{ themes: ThemesCollectionItem[]; }>();

const route = useRoute();
const { loggedIn } = useUserSession();
const perPage = 7;
const page = ref(parseInt((route.query.page as string) || '1'));
const { data: teaching } = await useAsyncData('teaching', () => queryCollection('teaching').first());
const { data: lessonsCount } = await useAsyncData('lessons-count', () => queryCollection('lessons').count());
const { data: lessons } = useAsyncData(
    route.path,
    () => queryCollection('lessons')
        .limit(perPage)
        .skip((page.value - 1) * perPage)
        .all(),
    { watch: [page] }
);

const { data: progress } = useAsyncData(
    route.path + '-progress',
    () => $fetch<{ success: boolean; data: UserProgress[] | null; }>('/api/teaching/progress', {
        method: 'GET'
    }),
    {
        immediate: loggedIn.value,
        server: false
    }
);

const doctrinesProgress = computed<{
    title: string;
    slug: string;
    completedLessons: number;
    totalLessons: number;
}[]>(() => {
    if (!progress.value?.data) return [];
    return progress.value.data.map(p => ({
        title: themes.find(t => t.slug === p.theme)?.title || '',
        slug: p.theme,
        completedLessons: p.lessons ? (JSON.parse(p.lessons) as string[]).length : 0,
        totalLessons: lessons.value?.filter(lesson => lesson.theme == p.theme).length || 0
    }));
});

const totalPages = Math.ceil((lessonsCount.value || 0) / perPage);
if (page.value < 1 || (route.query.page && page.value === 1) || page.value > totalPages) {
    navigateTo('/enseignements');
}
const isFirstLessonOfFirstPage = (lesson: LessonsCollectionItem) => lesson.id === lessons.value?.[0]?.id && page.value === 1;
const title = teaching.value?.seo?.title || teaching.value?.title;
const description = teaching.value?.seo?.description || teaching.value?.description;

useSeoMeta({
    title,
    ogTitle: title,
    description,
    ogDescription: description
});

const getTheme = (lesson: LessonsCollectionItem) => {
    return themes.find(theme => theme.path === '/enseignements/' + lesson.theme);
};

defineOgImageComponent('Saas');
</script>

<template>
    <UPage>
        <NuxtImg
            src="/images/hero-blog.webp"
            class="w-full aspect-video max-h-[32rem] object-center"
        />

        <UContainer>
            <UPageHeader
                v-bind="teaching"
                class="py-[50px]"
            >
                <DoctrineProgress
                    v-if="loggedIn && themes && lessons"
                    :doctrines="doctrinesProgress"
                    class="mt-4"
                />
            </UPageHeader>

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
                    :to="(p: number) => ({ path: '/enseignements', query: p > 1 ? { page: p } : {} })"
                    class="mt-10 flex justify-center"
                />
            </UPageBody>
        </UContainer>
    </UPage>
</template>

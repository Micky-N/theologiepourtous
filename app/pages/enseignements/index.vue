<script setup lang="ts">
import { useTeachingsApi } from '~/composables/useTeachingsApi';
import type { TeachingLessonData, TeachingThemeData, UserProgress } from '~/types';
import { useTeachingProgress } from '~/composables/useTeachingProgress';

const { themes } = defineProps<{ themes: TeachingThemeData[]; }>();

const route = useRoute();
const { isAuthenticated: loggedIn } = useSanctumAuth();
const { fetchLessons } = useTeachingsApi();
const { fetchAllProgress } = useTeachingProgress();
const perPage = 7;
const page = ref(parseInt((route.query.page as string) || '1'));
const toThemeColor = (color: string | null | undefined): 'primary' | 'secondary' | 'neutral' | 'error' | 'warning' | 'success' | 'info' => {
    const allowedColors = ['primary', 'secondary', 'neutral', 'error', 'warning', 'success', 'info'];

    return allowedColors.includes(color || '') ? color as 'primary' | 'secondary' | 'neutral' | 'error' | 'warning' | 'success' | 'info' : 'primary';
};
const { data: teaching } = await useAsyncData('teaching', () => queryCollection('teaching').first());
const { data: allLessons } = await useAsyncData('teaching-lessons', () => fetchLessons());

const { data: progress } = useAsyncData(
    route.path + '-progress',
    async () => await fetchAllProgress(),
    {
        immediate: loggedIn.value,
        server: false
    }
);

watch(() => route.query.page, (value) => {
    page.value = parseInt((value as string) || '1');
});

const lessons = computed(() => {
    const start = (page.value - 1) * perPage;
    return (allLessons.value || []).slice(start, start + perPage);
});

const doctrinesProgress = computed<{
    title: string;
    slug: string;
    completedLessons: number;
    totalLessons: number;
}[]>(() => {
    if (!progress.value) return [];
    return progress.value.map((p: UserProgress) => ({
        title: themes.find(t => t.slug === p.theme_slug)?.title || '',
        slug: p.theme_slug,
        completedLessons: p.lessons ? p.lessons.length : 0,
        totalLessons: allLessons.value?.filter(lesson => lesson.theme?.slug === p.theme_slug).length || 0
    }));
});

const totalPages = computed(() => Math.max(1, Math.ceil((allLessons.value?.length || 0) / perPage)));
if (page.value < 1 || (route.query.page && page.value === 1) || (allLessons.value?.length && page.value > totalPages.value)) {
    await navigateTo('/enseignements');
}

const isFirstLessonOfFirstPage = (lesson: TeachingLessonData) => lesson.id === lessons.value?.[0]?.id && page.value === 1;
const title = teaching.value?.seo?.title || teaching.value?.title;
const description = teaching.value?.seo?.description || teaching.value?.description;

useSeoMeta({
    title,
    ogTitle: title,
    description,
    ogDescription: description
});

const getTheme = (lesson: TeachingLessonData) => {
    return themes.find(theme => theme.slug === lesson.theme?.slug);
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
                        :to="lesson.path || `/enseignements/${lesson.theme?.slug}/${lesson.slug}`"
                        :title="lesson.title"
                        :description="lesson.excerpt || undefined"
                        :image="lesson.image_url || undefined"
                        :date="lesson.published_at ? new Date(lesson.published_at).toLocaleDateString('fr', { year: 'numeric', month: 'long', day: 'numeric' }) : undefined"
                        :badge="{ label: getTheme(lesson)?.title, color: toThemeColor(getTheme(lesson)?.color) }"
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
                    :total="allLessons?.length || 0"
                    :to="(p: number) => ({ path: '/enseignements', query: p > 1 ? { page: p } : {} })"
                    class="mt-10 flex justify-center"
                />
            </UPageBody>
        </UContainer>
    </UPage>
</template>

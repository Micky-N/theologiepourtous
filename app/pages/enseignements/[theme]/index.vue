<script setup lang="ts">
import { useTeachingsApi } from '~/composables/useTeachingsApi';
import { useTeachingProgress } from '~/composables/useTeachingProgress';

const route = useRoute();
const themeSlug = String(Array.isArray(route.params.theme) ? route.params.theme[0] : route.params.theme || '');
const { isAuthenticated: loggedIn } = useSanctumAuth();
const { fetchTheme } = useTeachingsApi();
const { fetchThemeProgress } = useTeachingProgress();
const toThemeColor = (color: string | null | undefined): 'primary' | 'secondary' | 'neutral' | 'error' | 'warning' | 'success' | 'info' => {
    const allowedColors = ['primary', 'secondary', 'neutral', 'error', 'warning', 'success', 'info'];

    return allowedColors.includes(color || '') ? color as 'primary' | 'secondary' | 'neutral' | 'error' | 'warning' | 'success' | 'info' : 'primary';
};
const { data: theme } = await useAsyncData(route.path, () => fetchTheme(themeSlug));

const { data: progress } = useAsyncData(
    route.path + '-progress',
    async () => theme.value?.slug ? await fetchThemeProgress(theme.value.slug) : null,
    {
        immediate: loggedIn.value,
        server: false
    }
);

const lessons = computed(() => theme.value?.lessons || []);
const firstLessonPath = computed(() => lessons.value[0]?.path || null);

useSeoMeta({
    title: theme.value?.title,
    description: theme.value?.seo.description,
    keywords: theme.value?.seo.keywords.join(', '),
    ogTitle: theme.value?.title,
    ogDescription: theme.value?.seo.description,
    ogImage: theme.value?.image_url,
    ogType: 'website'
});

useHead({
    htmlAttrs: {
        lang: theme.value?.seo.lang || 'fr'
    }
});
</script>

<template>
    <UPage v-if="theme">
        <UContainer>
            <NuxtImg
                :src="theme.image_url || undefined"
                class="w-full aspect-video max-h-[32rem] rounded-b-xl object-center"
            />
            <UButton
                v-if="loggedIn && firstLessonPath && (!progress || progress.lessons.length === 0)"
                icon="i-lucide-flag"
                size="xs"
                color="warning"
                variant="subtle"
                class="mt-4"
                :to="firstLessonPath"
            >
                Commencer le parcours
            </UButton>
            <UPageHeader
                :title="theme.title"
                :description="theme.excerpt || undefined"
                class="pb-[25px]"
            >
                <ThemeProgress
                    v-if="loggedIn && progress && lessons?.length"
                    :lessons="lessons.map(lesson => ({
                        title: lesson.title,
                        description: lesson.excerpt || '',
                        completed: progress?.lessons ? progress.lessons.some(l => l.slug === lesson.slug) : false
                    }))"
                    class="mt-4"
                />
                <div
                    v-else-if="lessons"
                    class="flex justify-center mt-4"
                >
                    <UBadge
                        :label="lessons.length + ' leçon' + (lessons.length > 1 ? 's' : '')"
                        variant="subtle"
                        size="lg"
                        color="neutral"
                    />
                </div>
            </UPageHeader>

            <UPageBody>
                <UBlogPosts v-if="lessons">
                    <UBlogPost
                        v-for="(lesson, index) in lessons"
                        :key="index"
                        :to="lesson.path || `/enseignements/${theme.slug}/${lesson.slug}`"
                        :title="lesson.title"
                        :description="lesson.excerpt || undefined"
                        :image="lesson.image_url || undefined"
                        :date="lesson.published_at ? new Date(lesson.published_at).toLocaleDateString('fr', { year: 'numeric', month: 'short', day: 'numeric' }) : undefined"
                        :badge="{ label: theme.title, color: toThemeColor(theme.color) }"
                        variant="naked"
                        :ui="{
                            description: 'line-clamp-2'
                        }"
                    />
                </UBlogPosts>
            </UPageBody>
        </UContainer>
    </UPage>
</template>

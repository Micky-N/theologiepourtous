<script setup lang="ts">
import { useTeachingProgress } from '~/composables/useTeachingProgress';

const route = useRoute();
const { isAuthenticated: loggedIn } = useSanctumAuth();
const { fetchThemeProgress, trackThemeProgress } = useTeachingProgress();
const { data: theme } = await useAsyncData(route.path, () => queryCollection('themes').path(route.path).first());
const { data: lessons } = useAsyncData(route.path + '/lessons', () => queryCollection('lessons').where('theme', '=', route.params.theme).all());

const { data: progress, refresh } = useAsyncData(
    route.path + '-progress',
    async () => theme.value?.slug ? await fetchThemeProgress(theme.value.slug) : null,
    {
        immediate: loggedIn.value,
        server: false
    }
);

const setProgress = async () => {
    try {
        if (!theme.value?.slug) {
            return;
        }

        await trackThemeProgress(theme.value.slug);
        await refresh();
    } catch (e) {
        console.log(e);
    }
};

useSeoMeta({
    title: theme.value?.title,
    description: theme.value?.seo.description,
    keywords: theme.value?.seo.keywords,
    ogTitle: theme.value?.title,
    ogDescription: theme.value?.seo.description,
    ogImage: theme.value?.image.src,
    ogType: 'website',
    ogUrl: theme.value?.seo.url,
    twitterCard: theme.value?.seo.card,
    twitterTitle: theme.value?.title,
    twitterDescription: theme.value?.seo.description,
    twitterImage: theme.value?.image.src
});

useHead({
    htmlAttrs: {
        lang: theme.value?.seo.lang || 'fr'
    },
    link: [
        { rel: 'canonical', href: theme.value?.seo.url }
    ]
});
</script>

<template>
    <UPage v-if="theme">
        <UContainer>
            <NuxtImg
                :src="theme.image.src"
                class="w-full aspect-video max-h-[32rem] rounded-b-xl object-center"
            />
            <UButton
                v-if="loggedIn && (!progress || JSON.parse(progress.lessons || '[]').length === 0)"
                icon="i-lucide-flag"
                size="xs"
                color="warning"
                variant="subtle"
                class="mt-4"
                @click="setProgress()"
            >
                Commencer le parcours
            </UButton>
            <UPageHeader
                :title="theme.title"
                :description="theme.description"
                class="pb-[25px]"
            >
                <ThemeProgress
                    v-if="loggedIn && progress && lessons?.length"
                    :lessons="lessons.map(lesson => ({
                        title: lesson.title,
                        description: lesson.description,
                        completed: progress?.lessons ? JSON.parse(progress.lessons).includes(lesson.slug) : false
                    }))"
                    class="mt-4"
                />
                <div
                    v-else-if="lessons"
                    class="flex justify-center mt-4"
                >
                    <UBadge
                        :label="lessons.length + ' articles'"
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
                        :to="lesson.path"
                        :title="lesson.title"
                        :description="lesson.description"
                        :image="lesson.image"
                        :date="new Date(lesson.date).toLocaleDateString('fr', { year: 'numeric', month: 'short', day: 'numeric' })"
                        :badge="{ label: theme.title, color: theme.color || 'primary' }"
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

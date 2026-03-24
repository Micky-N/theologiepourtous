<script setup lang="ts">
import { useTeachingsApi } from '~/composables/useTeachingsApi';
import type { BibleBookData } from '~/types';
import { useTeachingProgress } from '~/composables/useTeachingProgress';
import { verseParser } from '../../../utils/verseParser';
import type { ContentSurroundLink } from '@nuxt/ui/runtime/types/content.js';
import BiblicalReferencePopover from '~/components/mdc/BiblicalReferencePopover.vue';
import TheologicalGlossaryAnchor from '~/components/mdc/TheologicalGlossaryAnchor.vue';

const { isAuthenticated: loggedIn } = useSanctumAuth();
const { fetchThemeProgress, trackThemeProgress } = useTeachingProgress();
const route = useRoute();
const themeSlug = String(Array.isArray(route.params.theme) ? route.params.theme[0] : route.params.theme || '');
const lessonSlug = String(Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug || '');
const { fetchLesson } = useTeachingsApi();
const { data: lessonPage, status: lessonStatus } = await useAsyncData(route.path, () => fetchLesson(themeSlug, lessonSlug), {
    server: true
});
const lesson = computed(() => lessonPage.value?.current_lesson || null);
const { data: progress, refresh, status: progressStatus } = useAsyncData(
    route.path + '-progress',
    async () => await fetchThemeProgress(lesson.value?.theme?.slug || themeSlug),
    {
        immediate: loggedIn.value,
        server: false
    }
);

const { data: booksData } = await useAsyncData('bible-books', () => $fetch<{ success: boolean; data: { all: BibleBookData[]; grouped: { old: BibleBookData[]; new: BibleBookData[]; }; }; count: number; }>('/api/bible/books', {
    method: 'GET'
}));

const surround = computed(() => [
    lessonPage.value?.next_lesson,
    lessonPage.value?.previous_lesson
].map(item => item
    ? ({
        title: item.title,
        description: item.excerpt,
        path: item.path
    })
    : null) as ContentSurroundLink[]);

const learntLesson = (lessonSlug: string) => {
    if (!progress.value) return false;
    const lessons = progress.value.lessons;
    if (!lessons) return false;
    const lessonsArray = lessons.map(lesson => lesson.slug);
    return lessonsArray.length && lessonsArray.includes(lessonSlug);
};

const setProgress = async (slug: string) => {
    try {
        await trackThemeProgress(lesson.value?.theme?.slug || themeSlug, slug);
        await refresh();
    } catch (e) {
        console.log(e);
    }
};

setBooksData(booksData.value?.data.all || []);

const parseToVerse = (ref: string) => verseParser(ref, true);

useSeoMeta({
    title: lesson.value?.title,
    description: lesson.value?.seo.description,
    keywords: lesson.value?.seo.keywords.join(', '),
    author: 'Théologie pour Tous',
    ogTitle: lesson.value?.title,
    ogDescription: lesson.value?.seo.description,
    ogImage: lesson.value?.image_url,
    ogType: 'article',
    twitterTitle: lesson.value?.title,
    twitterDescription: lesson.value?.seo.description,
    twitterImage: lesson.value?.image_url
});

useHead({
    htmlAttrs: {
        lang: lesson.value?.seo.lang || 'fr'
    },
    link: [
        { rel: 'canonical', href: `${useRuntimeConfig().public.baseUrl}${lesson.value!.path}` }
    ]
});

const progressButtonProps = computed<{
    icon: string;
    color: 'success' | 'secondary' | 'warning';
    label: string;
    variant: 'subtle';
}>(() => {
    if (lesson.value && learntLesson(lesson.value.slug)) {
        return {
            icon: 'i-lucide-circle-check-big',
            color: 'success',
            label: 'Appris',
            variant: 'subtle'
        };
    } else if (progress.value && progress.value.lessons.length > 0) {
        console.log(progress.value.lessons);
        return {
            icon: 'i-lucide-circle-dashed',
            color: 'secondary',
            label: 'En cours',
            variant: 'subtle'
        };
    } else {
        return {
            icon: 'i-lucide-flag',
            color: 'warning',
            label: 'Commencer le parcours',
            variant: 'subtle'
        };
    }
});

watch(lessonStatus, (newStatus) => {
    if (newStatus == 'error' || (newStatus == 'success' && !lesson.value)) {
        throw createError({ statusCode: 404, message: 'Lesson not found', fatal: true });
    }
});

const transformParserSpans = () => {
    if (typeof window !== 'undefined') {
        const spans = document.querySelectorAll<HTMLSpanElement>('span[parser]');
        spans.forEach((span) => {
            const param = span.getAttribute('param');
            const parser = span.getAttribute('parser');
            if (!param || !parser) return;
            switch (parser) {
                case 'theological':
                    transformTag(span, TheologicalGlossaryAnchor, { term: param });
                    break;
                case 'verse':
                    transformTag(span, BiblicalReferencePopover, { verse: param });
                    break;
                default:
                    break;
            }
        });
    }
};

onMounted(() => {
    transformParserSpans();
});
</script>

<template>
    <UContainer v-if="lesson">
        <img
            :src="lesson.image_url || undefined"
            class="w-full aspect-video rounded-b-xl max-h-[32rem] object-cover object-center"
        >
        <UPageHeader
            :title="lesson.title"
            :description="lesson.excerpt || undefined"
        >
            <template #headline>
                <div class="flex flex-col lg:flex-row items-start lg:items-center space-x-1">
                    <template v-if="loggedIn">
                        <UButton
                            v-if="progressStatus === 'success'"
                            :icon="progressButtonProps.icon"
                            :color="progressButtonProps.color"
                            :label="progressButtonProps.label"
                            :variant="progressButtonProps.variant"
                            size="xs"
                            @click="setProgress(lesson.slug)"
                        />
                        <UButton
                            v-else-if="['idle', 'pending'].includes(progressStatus)"
                            color="secondary"
                            variant="subtle"
                            size="xs"
                            disabled
                        >
                            <UIcon
                                name="i-lucide-loader-2"
                                class="animate-spin"
                            />
                        </UButton>
                    </template>
                    <time class="text-muted">{{ lesson.published_at ? new
                        Date(lesson.published_at).toLocaleDateString('fr', {
                            year: 'numeric',
                            month:
                                'long',
                            day:
                                'numeric'
                        }) : '' }}</time>
                    <span class="hidden lg:block text-muted">&middot;</span>
                    <!-- tags -->
                    <div>
                        <span
                            v-for="(tag, idx) in lesson.tags"
                            :key="tag"
                            class="text-warning-600 font-light"
                        >
                            {{ tag }}<span v-if="idx !== lesson.tags.length - 1">, </span>
                        </span>
                    </div>
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
                    <UButton
                        v-for="ref in lesson.biblical_references"
                        :key="ref"
                        :label="ref"
                        color="secondary"
                        variant="subtle"
                        size="xs"
                        :to="parseToVerse(ref)"
                        target="_blank"
                    />
                </div>
            </div>
        </UPageHeader>

        <UPage>
            <UPageBody>
                <MDC
                    v-if="lesson.content"
                    :value="lesson.content"
                />

                <USeparator v-if="surround?.length" />

                <UContentSurround :surround="surround" />
            </UPageBody>
        </UPage>
    </UContainer>
</template>

<style>
@reference "~/assets/css/main.css";

span[parser="theological"] {
    @apply cursor-help text-primary-600 border-b border-dotted border-primary-600 dark:text-primary-400 dark:border-primary-400;
}
</style>

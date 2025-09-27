<script setup lang="ts">
import type { UserProgress } from '@prisma/client';

const { loggedIn } = useUserSession();
const route = useRoute();
const { data: lesson } = await useAsyncData(route.path, () => queryCollection('lessons').path(route.path).first());
if (!lesson.value) {
    throw createError({ statusCode: 404, statusMessage: 'Lesson not found', fatal: true });
}
const { data: progress, refresh } = useAsyncData(
    route.path + '-progress',
    () => $fetch<{ success: boolean, data: UserProgress | null }>(`/api/teaching/progress/${lesson.value?.theme}`, {
        method: 'GET'
    }),
    {
        immediate: loggedIn.value
    }
);

const { data: booksData } = await useAsyncData('bible-books', () => $fetch('/api/bible/books', {
    method: 'GET'
}));

const { data: surround } = useAsyncData(`${route.path}-surround`, () => {
    return queryCollectionItemSurroundings('lessons', route.path, {
        fields: ['description']
    }).where('theme', '=', route.params.theme);
});

const learntLesson = (lesson: string) => {
    if (!progress.value?.data) return false;
    const lessons = progress.value?.data.lessons;
    if (!lessons) return false;
    const lessonsArray = JSON.parse(lessons) as string[];
    return lessonsArray.length && lessonsArray.includes(lesson);
};

const setProgress = async (slug: string) => {
    try {
        await $fetch<{ success: boolean, data: UserProgress | null }>(`/api/teaching/progress/${lesson.value?.theme}`, {
            method: 'POST',
            body: { lesson: slug }
        });
        await refresh();
    } catch (e) {
        console.log(e);
    }
};

/**
 * 1 Jean 1:1 -> /bible?book=1JN&chapter=1&verse=1
 * 1 Jean 1:1-3 -> /bible?book=1JN&chapter=1&verse=1-3
 * 1 Jean 1 -> /bible?book=1JN&chapter=1
 * 1 Jean -> /bible?book=1JN
 * Psaumes 23 -> /bible?book=PSA&chapter=23
 * Psaumes 23:1 -> /bible?book=PSA&chapter=23&verse=1
 * Psaumes 23:1-4 -> /bible?book=PSA&chapter=23&verse=1-4
 * Psaumes 23:1-4;1 -> /bible?book=PSA&chapter=23&verse=1-4;1
 * @param ref
 */
const parseToVerse = (ref: string) => {
    let refTrimmed = ref.trim();
    if (!booksData.value) return '/bible';
    const bookMatch = refTrimmed.match(/^(1|2|3)?\s?([^\d:]+)/);
    if (!bookMatch) return '/bible';
    const bookName = bookMatch[0].trim();
    const book = booksData.value?.data.all.find((b: any) => b.name.toLowerCase() === bookName.toLowerCase());
    if (!book) return '/bible';
    refTrimmed = refTrimmed.replace(bookMatch[0], '').trim();
    if (!refTrimmed) return `/bible?book=${book.code}`;
    const chapterVerseMatch = refTrimmed.match(/^(\d+)(?::([\d\-;]+))?$/);
    if (!chapterVerseMatch) return `/bible?book=${book.code}`;
    let url = `/bible?book=${book.code}`;
    if (chapterVerseMatch[1]) {
        url += `&chapter=${chapterVerseMatch[1]}`;
    }
    if (chapterVerseMatch[2]) {
        url += `&verse=${chapterVerseMatch[2]}`;
    }
    return url;
};

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
                <div class="flex flex-col lg:flex-row items-start lg:items-center space-x-1">
                    <UButton
                        v-if="learntLesson(lesson.slug)"
                        icon="i-lucide-circle-check-big"
                        size="xs"
                        color="success"
                        variant="subtle"
                        @click="setProgress(lesson.slug)"
                    >
                        Appris
                    </UButton>
                    <UButton
                        v-else-if="!!progress?.data"
                        icon="i-lucide-circle-dashed"
                        size="xs"
                        color="secondary"
                        variant="subtle"
                        @click="setProgress(lesson.slug)"
                    >
                        En cours
                    </UButton>
                    <UButton
                        v-else
                        icon="i-lucide-flag"
                        size="xs"
                        color="warning"
                        variant="subtle"
                        @click="setProgress(lesson.slug)"
                    >
                        Commencer le parcours
                    </UButton>
                    <time class="text-muted">{{ new Date(lesson.date).toLocaleDateString('fr', { year: 'numeric', month: 'long', day: 'numeric' }) }}</time>
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

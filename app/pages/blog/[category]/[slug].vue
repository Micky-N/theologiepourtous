<script setup lang="ts">
import type { ContentSurroundLink } from '@nuxt/ui/runtime/types/content.js';
import { useBlogApi } from '~/composables/useBlogApi';
import { toAuthorLinkButtons } from '~/utils/blogAuthors';

const route = useRoute();
const categorySlug = String(Array.isArray(route.params.category) ? route.params.category[0] : route.params.category || '');
const articleSlug = String(Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug || '');
const { fetchArticle } = useBlogApi();
const { data: articlePage, error } = await useAsyncData(route.path, () => fetchArticle(categorySlug, articleSlug, true), {
    server: true
});

const article = computed(() => articlePage.value?.current_article || null);

if (error.value || !article.value) {
    throw createError({ statusCode: 404, message: 'Article introuvable', fatal: true });
}

const surround = computed<ContentSurroundLink[]>(() => [
    articlePage.value?.next_article,
    articlePage.value?.previous_article
].map(item => item
    ? ({
        title: item.title,
        description: item.excerpt || undefined,
        path: item.path || undefined
    })
    : null) as ContentSurroundLink[]);

const authorLinks = computed(() => article.value ? toAuthorLinkButtons(article.value.author) : []);

useSeoMeta({
    title: article.value.title,
    description: article.value.seo.description,
    keywords: article.value.seo.keywords.join(', '),
    ogTitle: article.value.title,
    ogDescription: article.value.seo.description,
    ogImage: article.value.image_url,
    ogType: 'article',
    twitterTitle: article.value.title,
    twitterDescription: article.value.seo.description,
    twitterImage: article.value.image_url
});

useHead({
    htmlAttrs: {
        lang: article.value.seo.lang || 'fr'
    },
    link: article.value.path
        ? [
            { rel: 'canonical', href: `${useRuntimeConfig().public.baseUrl}${article.value.path}` }
        ]
        : []
});

if (article.value.image_url) {
    defineOgImage({
        url: article.value.image_url
    });
} else {
    defineOgImageComponent('Saas', {
        headline: 'Blog',
        title: article.value.title
    });
}
</script>

<template>
    <UContainer v-if="article">
        <img
            :src="article.image_url || undefined"
            class="w-full aspect-video rounded-b-xl max-h-[32rem] object-cover object-center"
        >
        <UPageHeader
            :title="article.title"
            :description="article.excerpt || undefined"
        >
            <template #headline>
                <div class="flex flex-wrap items-center gap-2">
                    <ULink
                        v-if="article.category"
                        :label="article.category.title"
                        :to="article.category.path || undefined"
                        color="primary"
                        variant="subtle"
                        size="xs"
                    />
                    <span
                        v-if="article.category && article.published_at"
                        class="text-muted"
                    >&middot;</span>
                    <time class="text-muted">{{ article.published_at ? new
                        Date(article.published_at).toLocaleDateString('fr', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }) : '' }}</time>
                </div>
            </template>

            <div class="flex flex-col gap-4 mt-4">
                <ClientOnly>
                    <UUser
                        :name="article.author.name || 'Auteur inconnu'"
                        :description="article.author.role || 'Rôle inconnu'"
                        :avatar="{
                            src: article.author.photo || 'https://i.pravatar.cc/150?u=john-doe'
                        }"
                        size="2xl"
                        class="items-start"
                    >
                        <template #description>
                            <p class="text-sm">
                                {{ article.author.role || 'Rôle inconnu' }}
                            </p>
                            <div
                                v-if="authorLinks.length"
                                class="flex flex-wrap items-center gap-2"
                            >
                                <ULink
                                    v-for="authorLink in authorLinks"
                                    :key="authorLink.to"
                                    :label="authorLink.label"
                                    :to="authorLink.to"
                                    color="neutral"
                                    :icon="authorLink.icon"
                                    class="text-neutral-600 font-light"
                                    variant="link"
                                    size="xs"
                                    target="_blank"
                                />
                            </div>
                        </template>
                    </UUser>
                </ClientOnly>

                <div
                    v-if="article.tags.length"
                    class="flex flex-wrap items-center gap-3"
                >
                    <UIcon
                        name="mdi:tag-outline"
                        size="xs"
                        class="text-warning-600"
                    />
                    <ULink
                        v-for="tag in article.tags"
                        :key="tag.slug"
                        :label="tag.title"
                        :to="tag.path || undefined"
                        color="warning"
                        class="text-warning-600 font-light w-fit"
                        variant="link"
                        size="lg"
                    />
                </div>
            </div>
        </UPageHeader>

        <UPage>
            <UPageBody>
                <MDC
                    v-if="article.content"
                    :value="article.content"
                />

                <USeparator v-if="surround.length" />

                <UContentSurround :surround="surround" />
            </UPageBody>
        </UPage>
    </UContainer>
</template>

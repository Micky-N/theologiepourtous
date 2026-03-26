<script setup lang="ts">
import { useBlogApi } from '~/composables/useBlogApi';
import type { BlogArticleData, BlogTermData } from '~/types';
import { toBlogPostAuthors } from '~/utils/blogAuthors';

const { articles, categories } = defineProps<{ articles: BlogArticleData[]; categories: BlogTermData[]; }>();

const route = useRoute();
const categorySlug = String(Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug || '');
const { fetchCategory } = useBlogApi();
const { data: category, error } = await useAsyncData(route.path, () => fetchCategory(categorySlug));

if (error.value || !category.value) {
    const legacyArticle = articles.find(article => article.slug === categorySlug && article.path);

    if (legacyArticle?.path) {
        await navigateTo(legacyArticle.path, {
            redirectCode: 301
        });
    }

    throw createError({ statusCode: 404, message: 'Categorie introuvable', fatal: true });
}

const description = `${category.value.articles_count || 0} article${(category.value.articles_count || 0) > 1 ? 's' : ''} dans cette categorie.`;

const items = computed(() => categories.map(category => ({
    ...category,
    label: category.title,
    to: category.path || `/blog/${category.slug}`,
    children: [],
    active: route.path === category.path || route.path.startsWith(`${category.path}/`)
})));

useSeoMeta({
    title: category.value.title,
    ogTitle: category.value.title,
    description,
    ogDescription: description
});

defineOgImageComponent('Saas', {
    headline: 'Blog',
    title: category.value.title
});
</script>

<template>
    <UContainer v-if="category">
        <UPageHeader
            :title="category.title"
            :description="description"
            class="py-[50px]"
        />

        <UPage>
            <template #left>
                <UPageAside>
                    <h4 class="mb-2">
                        Catégories
                    </h4>
                    <UNavigationMenu
                        v-if="items?.length"
                        :items="items"
                        highlight
                        orientation="vertical"
                    />
                </UPageAside>
            </template>
            <UPageBody>
                <UBlogPosts v-if="category.articles?.length">
                    <UBlogPost
                        v-for="(post, index) in category.articles"
                        :key="index"
                        :to="post.path || undefined"
                        :title="post.title"
                        :description="post.excerpt || undefined"
                        :image="post.image_url || undefined"
                        :date="post.published_at ? new Date(post.published_at).toLocaleDateString('fr', { year: 'numeric', month: 'short', day: 'numeric' }) : undefined"
                        :authors="toBlogPostAuthors(post.author)"
                        :badge="{ label: category.title }"
                        orientation="vertical"
                        variant="naked"
                        :ui="{
                            description: 'line-clamp-2'
                        }"
                    />
                </UBlogPosts>
                <UAlert
                    v-else
                    color="neutral"
                    variant="subtle"
                    title="Aucun article"
                    description="Cette categorie ne contient pas encore d'article public."
                />
            </UPageBody>
        </UPage>
    </UContainer>
</template>

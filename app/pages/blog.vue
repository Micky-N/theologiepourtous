<script setup lang="ts">
import { useBlogApi } from '~/composables/useBlogApi';
import type { BlogArticleData, BlogTermData } from '~/types';

const { fetchArticles, getActualCategories } = useBlogApi();
const { data: articles } = await useAsyncData('blog-articles-navigation', () => fetchArticles(), {
    server: true,
    default: () => [] as BlogArticleData[]
});

const safeArticles = computed<BlogArticleData[]>(() => articles.value || []);
const categories = computed<BlogTermData[]>(() => getActualCategories(safeArticles.value));
</script>

<template>
    <NuxtPage
        :articles="safeArticles"
        :categories="categories"
    />
</template>

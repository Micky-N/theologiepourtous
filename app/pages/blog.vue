<script setup lang="ts">
import { useBlogApi } from '~/composables/useBlogApi';
import type { BlogArticleData, BlogTermData } from '~/types';

const route = useRoute();
const { fetchArticles } = useBlogApi();
const { data: articles } = await useAsyncData('blog-articles-navigation', () => fetchArticles());

const categories = computed<BlogTermData[]>(() => {
    const items = new Map<string, BlogTermData>();

    for (const article of articles.value || []) {
        if (!article.category?.slug) {
            continue;
        }

        const existing = items.get(article.category.slug);

        if (existing) {
            existing.articles_count = (existing.articles_count || 0) + 1;
            continue;
        }

        items.set(article.category.slug, {
            ...article.category,
            articles_count: 1
        });
    }

    return [...items.values()];
});

const items = computed(() => categories.value.map((category: BlogTermData) => ({
    ...category,
    label: category.title,
    to: category.path || `/blog/${category.slug}`,
    children: [],
    active: route.path === category.path || route.path.startsWith(`${category.path}/`)
})));

const safeArticles = computed<BlogArticleData[]>(() => articles.value || []);
</script>

<template>
    <div>
        <UHeader
            title="Categories"
            to="/blog"
            mode="slideover"
        >
            <ClientOnly>
                <UNavigationMenu
                    :items="items"
                    :ui="{
                        list: 'gap-10',
                        link: 'gap-0',
                        linkTrailingIcon: 'hidden size-0'
                    }"
                />
            </ClientOnly>
            <template #body>
                <ClientOnly>
                    <UNavigationMenu
                        variant="link"
                        :highlight="true"
                        :items="items"
                        orientation="vertical"
                        :ui="{
                            list: 'space-y-2'
                        }"
                    />
                </ClientOnly>
            </template>
        </UHeader>
        <NuxtPage
            :articles="safeArticles"
            :categories="categories"
        />
    </div>
</template>

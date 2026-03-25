<script setup lang="ts">
import type { BlogArticleData } from '~/types';
import { toBlogPostAuthors } from '~/utils/blogAuthors';

const { articles } = defineProps<{ articles: BlogArticleData[]; }>();

const route = useRoute();
const perPage = 6;
const page = ref(parseInt((route.query.page as string) || '1'));
const { data: blog } = await useAsyncData('blog', () => queryCollection('blog').first());

watch(() => route.query.page, (value) => {
    page.value = parseInt((value as string) || '1');
});

const posts = computed(() => {
    const start = (page.value - 1) * perPage;
    return articles.slice(start, start + perPage);
});

const totalPages = computed(() => Math.max(1, Math.ceil(articles.length / perPage)));
if (page.value < 1 || (route.query.page && page.value === 1) || (articles.length && page.value > totalPages.value)) {
    await navigateTo('/blog');
}

const title = blog.value?.seo?.title || blog.value?.title;
const description = blog.value?.seo?.description || blog.value?.description;

useSeoMeta({
    title,
    ogTitle: title,
    description,
    ogDescription: description
});

defineOgImageComponent('Saas');
</script>

<template>
    <UContainer>
        <UPageHeader
            v-bind="blog"
            class="py-[50px]"
        />

        <UPageBody>
            <UBlogPosts>
                <UBlogPost
                    v-for="(post, index) in posts"
                    :key="index"
                    :to="post.path || undefined"
                    :title="post.title"
                    :description="post.excerpt || undefined"
                    :image="post.image_url || undefined"
                    :date="post.published_at ? new Date(post.published_at).toLocaleDateString('fr', { year: 'numeric', month: 'short', day: 'numeric' }) : undefined"
                    :authors="toBlogPostAuthors(post.author)"
                    :badge="post.category ? { label: post.category.title } : undefined"
                    :orientation="index === 0 ? 'horizontal' : 'vertical'"
                    :class="[index === 0 && 'col-span-full']"
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
                :total="articles.length"
                :to="(p) => ({ path: '/blog', query: p > 1 ? { page: p } : {} })"
                class="mt-10 flex justify-center"
            />
        </UPageBody>
    </UContainer>
</template>

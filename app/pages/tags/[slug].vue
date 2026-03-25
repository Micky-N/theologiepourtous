<script setup lang="ts">
import { useBlogApi } from '~/composables/useBlogApi';
import { toBlogPostAuthors } from '~/utils/blogAuthors';

const route = useRoute();
const tagSlug = String(Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug || '');
const { fetchTag } = useBlogApi();
const { data: tag, error } = await useAsyncData(route.path, () => fetchTag(tagSlug));

if (error.value || !tag.value) {
    throw createError({ statusCode: 404, message: 'Tag introuvable', fatal: true });
}

const description = `${tag.value.articles_count || 0} article${(tag.value.articles_count || 0) > 1 ? 's' : ''} associe${(tag.value.articles_count || 0) > 1 ? 's' : ''} a ce tag.`;

useSeoMeta({
    title: tag.value.title,
    ogTitle: tag.value.title,
    description,
    ogDescription: description
});

defineOgImageComponent('Saas', {
    headline: 'Blog',
    title: tag.value.title
});
</script>

<template>
    <UContainer v-if="tag">
        <UPageHeader
            :title="tag.title"
            :description="description"
            class="py-[50px]"
        />

        <UPageBody>
            <UBlogPosts v-if="tag.articles?.length">
                <UBlogPost
                    v-for="(post, index) in tag.articles"
                    :key="index"
                    :to="post.path || undefined"
                    :title="post.title"
                    :description="post.excerpt || undefined"
                    :image="post.image_url || undefined"
                    :date="post.published_at ? new Date(post.published_at).toLocaleDateString('fr', { year: 'numeric', month: 'short', day: 'numeric' }) : undefined"
                    :authors="toBlogPostAuthors(post.author)"
                    :badge="post.category ? { label: post.category.title } : { label: tag.title }"
                    orientation="vertical"
                    variant="outline"
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
                description="Ce tag ne contient pas encore d'article public."
            />
        </UPageBody>
    </UContainer>
</template>

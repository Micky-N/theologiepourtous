<script setup lang="ts">
const route = useRoute()
const perPage = 6
const page = ref(parseInt((route.query.page as string) || '1'))
const { data: blog } = await useAsyncData('blog', () => queryCollection('blog').first())
const { data: postsCount } = await useAsyncData('posts-count', () => queryCollection('posts').count())

const { data: posts } = useAsyncData(
    route.path,
    () => queryCollection('posts')
        .limit(perPage)
        .skip((page.value - 1) * perPage)
        .all(),
    { watch: [page] }
)
const totalPages = Math.ceil((postsCount.value || 0) / perPage)
const title = blog.value?.seo?.title || blog.value?.title
const description = blog.value?.seo?.description || blog.value?.description

useSeoMeta({
    title,
    ogTitle: title,
    description,
    ogDescription: description
})

defineOgImageComponent('Saas')
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
                    :to="post.path"
                    :title="post.title"
                    :description="post.description"
                    :image="post.image"
                    :date="new Date(post.date).toLocaleDateString('fr', { year: 'numeric', month: 'short', day: 'numeric' })"
                    :authors="[{ ...post.author, to: post.author.to || undefined }]"
                    :badge="post.badge"
                    orientation="vertical"
                    variant="outline"
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
                :total="postsCount"
                :to="(p) => ({ path: '/blog', query: p > 1 ? { page: p } : {} })"
                class="mt-10 flex justify-center"
            />
        </UPageBody>
    </UContainer>
</template>

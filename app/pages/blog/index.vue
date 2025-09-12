<script setup lang="ts">
import type { PostsCollectionItem } from '@nuxt/content'

const route = useRoute()
const perPage = 7
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
if (page.value < 1 || (route.query.page && page.value === 1) || page.value > totalPages) {
    navigateTo('/blog')
}
const isFirstPostOfFirstPage = (post: PostsCollectionItem) => post.id === posts.value?.[0]?.id && page.value === 1
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
    <UPage>
        <NuxtImg
            src="/images/hero-blog.webp"
            class="w-full aspect-video max-h-[32rem] object-cover object-center"
        />

        <UContainer>
            <UPageHeader
                v-bind="blog"
                class="py-[50px]"
            />

            <UPageBody>
                <UBlogPosts v-if="posts">
                    <UBlogPost
                        v-for="(post, index) in posts"
                        :key="index"
                        :to="post.path"
                        :title="post.title"
                        :description="post.description"
                        :image="post.image"
                        :date="new Date(post.date).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' })"
                        :authors="[post.author]"
                        :badge="post.badge"
                        :orientation="isFirstPostOfFirstPage(post) ? 'horizontal' : 'vertical'"
                        :class="[isFirstPostOfFirstPage(post) && 'col-span-full']"
                        variant="naked"
                        :ui="{
                            description: 'line-clamp-2'
                        }"
                    />
                </UBlogPosts>
                <UPagination
                    v-if="totalPages > 1"
                    v-model:page="page"
                    show-edges
                    :total="postsCount"
                    :to="(p) => ({ path: '/blog', query: p > 1 ? { page: p } : {} })"
                    class="mt-10 flex justify-center"
                />
            </UPageBody>
        </UContainer>
    </UPage>
</template>

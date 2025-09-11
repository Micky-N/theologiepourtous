<script setup lang="ts">
const route = useRoute()

const { data: page } = useAsyncData('blog', () => queryCollection('blog').first())
const { data: posts } = useAsyncData(route.path, () => queryCollection('posts').where('theme', '=', route.params.theme).all())

const theme = page.value?.sections.find(section => section.slug === route.params.theme)
const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description
useSeoMeta({
    title,
    ogTitle: title,
    description,
    ogDescription: description
})

defineOgImageComponent('Saas')
</script>

<template>
    <UPage v-if="page && posts">
        <NuxtImg
            :src="theme?.image || '/images/hero-blog.webp'"
            class="w-full aspect-video max-h-[44rem] object-cover object-center"
        />

        <UContainer>
            <UPageHeader
                :title="theme?.label || page.title"
                :description="theme?.description || page.description"
                class="pt-[50px] pb-[25px]"
            >
                <div class="flex justify-center mt-4">
                    <UBadge
                        :label="posts.length + ' articles'"
                        variant="subtle"
                        size="lg"
                        color="neutral"
                    />
                </div>
            </UPageHeader>

            <UPageBody>
                <UBlogPosts>
                    <UBlogPost
                        v-for="(post, index) in posts"
                        :key="index"
                        :to="post.path"
                        :title="post.title"
                        :description="post.description"
                        :image="post.image"
                        :date="new Date(post.date).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' })"
                        :authors="post.authors"
                        :badge="post.badge"
                        variant="naked"
                        :ui="{
                            description: 'line-clamp-2'
                        }"
                    />
                </UBlogPosts>
            </UPageBody>
        </UContainer>
    </UPage>
</template>

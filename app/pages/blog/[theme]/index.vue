<script setup lang="ts">
const route = useRoute()
const { data: theme } = await useAsyncData(route.path, () => queryCollection('themes').path(route.path).first())
const { data: posts } = await useAsyncData(route.path + '/posts', () => queryCollection('posts').where('theme', '=', route.params.theme).all())

useSeoMeta({
    ...theme.value?.seo
})
</script>

<template>
    <UPage v-if="theme">
        <NuxtImg
            :src="theme?.image || '/images/hero-blog.webp'"
            class="w-full aspect-video max-h-[44rem] object-cover object-center"
        />
        <UContainer>
            <UPageHeader
                :title="theme.title"
                :description="theme.description"
                class="pt-[50px] pb-[25px]"
            >
                <div
                    v-if="posts"
                    class="flex justify-center mt-4"
                >
                    <UBadge
                        :label="posts.length + ' articles'"
                        variant="subtle"
                        size="lg"
                        color="neutral"
                    />
                </div>
            </UPageHeader>

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

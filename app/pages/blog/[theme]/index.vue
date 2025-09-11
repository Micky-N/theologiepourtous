<script setup lang="ts">
const route = useRoute()
const themeParam = route.params.theme as string
const { data: page } = await useAsyncData(route.path, () => queryCollection('themes').where('slug', '=', themeParam).first())
const { data: posts } = await useAsyncData(route.path + '/posts', () => queryCollection('posts').where('theme', '=', route.params.theme).all())
useSeoMeta({
    title: page.value?.title,
    ...page.value?.seo
})
</script>

<template>
    <UPage v-if="page && posts">
        <NuxtImg
            :src="page?.image || '/images/hero-blog.webp'"
            class="w-full aspect-video max-h-[44rem] object-cover object-center"
        />
        <UContainer>
            <UPageHeader
                :title="page.title"
                :description="page?.description || page.description"
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

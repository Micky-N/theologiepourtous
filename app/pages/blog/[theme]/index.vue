<script setup lang="ts">
const route = useRoute()
const { data: theme } = await useAsyncData(route.path, () => queryCollection('themes').path(route.path).first())
const { data: posts } = useAsyncData(route.path + '/posts', () => queryCollection('posts').where('theme', '=', route.params.theme).all())

useSeoMeta({
    title: theme.value?.title,
    description: theme.value?.seo.description,
    keywords: theme.value?.seo.keywords,
    ogTitle: theme.value?.title,
    ogDescription: theme.value?.seo.description,
    ogImage: theme.value?.image.src,
    ogType: 'website',
    ogUrl: theme.value?.seo.url,
    twitterCard: theme.value?.seo.card,
    twitterTitle: theme.value?.title,
    twitterDescription: theme.value?.seo.description,
    twitterImage: theme.value?.image.src
})

useHead({
    htmlAttrs: {
        lang: theme.value?.seo.lang || 'fr'
    },
    link: [
        { rel: 'canonical', href: theme.value?.seo.url }
    ]
})
</script>

<template>
    <UPage v-if="theme">
        <img
            :src="theme.image.src"
            class="w-full aspect-video max-h-[32rem] object-cover object-center"
        >
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
                        :authors="[post.author]"
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

<script setup lang="ts">
const route = useRoute()

const { data: post } = await useAsyncData(route.path, () => queryCollection('posts').path(route.path).first())
if (!post.value) {
    throw createError({ statusCode: 404, statusMessage: 'Post not found', fatal: true })
}

const { data: surround } = useAsyncData(`${route.path}-surround`, () => {
    return queryCollectionItemSurroundings('posts', route.path, {
        fields: ['description']
    })
})

useSeoMeta({
    title: post.value.title,
    description: post.value.seo.description,
    keywords: post.value.seo.keywords,
    author: post.value.author.name,
    ogTitle: post.value.title,
    ogDescription: post.value.seo.description,
    ogImage: post.value.image.src,
    ogType: 'article',
    ogUrl: post.value.seo.url,
    twitterCard: post.value.seo.card,
    twitterTitle: post.value.title,
    twitterDescription: post.value.seo.description,
    twitterImage: post.value.image.src
})

useHead({
    htmlAttrs: {
        lang: post.value?.seo.lang || 'fr'
    },
    link: [
        { rel: 'canonical', href: post.value.seo.url }
    ]
})
</script>

<template>
    <UContainer v-if="post">
        <img
            :src="post.image.src"
            class="w-full aspect-video max-h-[32rem] object-cover object-center"
        >
        <UPageHeader
            :title="post.title"
            :description="post.description"
        >
            <template #headline>
                <UBadge
                    v-bind="post.badge"
                    variant="subtle"
                />
                <span class="text-muted">&middot;</span>
                <time class="text-muted">{{ new Date(post.date).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' }) }}</time>
            </template>

            <div class="flex flex-wrap items-center gap-3 mt-4">
                <UButton
                    :to="post.author.to"
                    color="neutral"
                    variant="subtle"
                    target="_blank"
                    size="sm"
                >
                    <UAvatar
                        v-bind="post.author.avatar"
                        alt="Author avatar"
                        size="sm"
                    />

                    {{ post.author.name }}
                </UButton>
            </div>
        </UPageHeader>

        <UPage>
            <UPageBody>
                <ContentRenderer
                    v-if="post"
                    :value="post"
                />

                <USeparator v-if="surround?.length" />

                <UContentSurround :surround="surround" />
            </UPageBody>

            <template
                v-if="post?.body?.toc?.links?.length"
                #right
            >
                <UContentToc :links="post.body.toc.links" />
            </template>
        </UPage>
    </UContainer>
</template>

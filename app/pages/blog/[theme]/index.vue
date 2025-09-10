<script setup lang="ts">
const route = useRoute()

const { data: page } = await useAsyncData('blog', () => queryCollection('blog').first())
const { data: posts } = await useAsyncData(route.path, () => queryCollection('posts').all())

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description

useSeoMeta({
    title,
    ogTitle: title,
    description,
    ogDescription: description
})

defineOgImageComponent('Saas')
const getPostsBySlug = (slug: string) => {
    return posts.value?.filter(post => post.path.startsWith('/blog/' + slug)) || []
}
</script>

<template>
    <UPage v-if="page">
        <UHeader
            title="Thèmes"
            to="/blog"
            mode="slideover"
        >
            <UNavigationMenu
                variant="link"
                :highlight="true"
                highlight-color="primary"
                :items="page.sections"
                :ui="{
                    list: 'gap-10',
                    linkTrailingIcon: 'hidden'
                }"
            >
                <template #item-content="{ item }">
                    <UBlogPost
                        :title="item.label"
                        :description="item.description"
                        :image="item.image"
                        :to="item.to"
                        orientation="horizontal"
                        variant="ghost"
                        :badge="getPostsBySlug(item.slug).length + ' articles'"
                    />
                </template>
            </UNavigationMenu>
            <template #body>
                <UNavigationMenu
                    variant="link"
                    :highlight="true"
                    :items="page.sections"
                    orientation="vertical"
                    :ui="{
                        list: 'space-y-2'
                    }"
                />
            </template>
        </UHeader>
        <img
            src="/images/hero-blog.webp"
            class="w-full object-cover object-center"
        >

        <UContainer>
            <UPageHeader
                v-bind="page"
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
                        :date="new Date(post.date).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' })"
                        :authors="post.authors"
                        :badge="post.badge"
                        :orientation="index === 0 ? 'horizontal' : 'vertical'"
                        :class="[index === 0 && 'col-span-full']"
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

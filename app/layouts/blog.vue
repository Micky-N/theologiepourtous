<script lang="ts" setup>
const { data: page } = useAsyncData('blog', () => queryCollection('blog').first())
const { data: posts } = useAsyncData('themes', () => queryCollection('posts').select('id', 'theme').all())

const countPostsByTheme = computed(() => {
    const themes: Record<string, number> = {}
    posts.value?.forEach((post) => {
        const theme = post.theme || 'Uncategorized'
        if (!themes[theme]) {
            themes[theme] = 0
        }
        themes[theme]++
    })
    return themes
})
</script>

<template>
    <div>
        <AppHeader />
        <UHeader
            title="Thèmes"
            to="/blog"
            mode="slideover"
        >
            <ClientOnly>
                <UNavigationMenu
                    v-if="page"
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
                            :badge="countPostsByTheme[item.slug] + ' articles'"
                        />
                    </template>
                </UNavigationMenu>
            </ClientOnly>
            <template #body>
                <ClientOnly>
                    <UNavigationMenu
                        v-if="page"
                        variant="link"
                        :highlight="true"
                        :items="page.sections"
                        orientation="vertical"
                        :ui="{
                            list: 'space-y-2'
                        }"
                    />
                </ClientOnly>
            </template>
        </UHeader>

        <UMain>
            <slot />
        </UMain>

        <AppFooter />
    </div>
</template>

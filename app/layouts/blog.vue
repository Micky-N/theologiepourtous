<script lang="ts" setup>
const route = useRoute()
const { data: navigations } = useAsyncData('navigations', () => queryCollectionNavigation('themes', ['description', 'image']))

const items = computed(() => {
    if (!navigations.value) {
        return []
    }
    const firstNav = navigations.value[0]?.children
    if (!firstNav) {
        return []
    }
    return firstNav.map(item => ({
        ...item,
        image: item.image as string,
        description: item.description as string,
        label: item.title,
        to: item.path,
        children: item.children?.filter(child => child.path !== item.path) || [],
        active: route.path.startsWith(item.path)
    }))
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
                    :items="items"
                    :ui="{
                        list: 'gap-10',
                        linkTrailingIcon: 'hidden'
                    }"
                >
                    <template #item-content="{ item }">
                        <UBlogPost
                            :title="item.title"
                            :description="item.description.slice(0, 100) + (item.description.length > 100 ? '...' : '')"
                            :image="item.image"
                            :to="item.to"
                            orientation="horizontal"
                            variant="ghost"
                            :badge="item.children?.length + ' articles'"
                        />
                    </template>
                </UNavigationMenu>
            </ClientOnly>
            <template #body>
                <ClientOnly>
                    <UNavigationMenu
                        variant="link"
                        :highlight="true"
                        :items="items"
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

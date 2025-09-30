<script setup lang="ts">
const route = useRoute();
const { data: navigations } = useAsyncData('navigations', () => queryCollectionNavigation('themes', ['description', 'image', 'color', 'slug']));

const items = computed(() => {
    if (!navigations.value) {
        return [];
    }
    const firstNav = navigations.value[0]?.children;
    if (!firstNav) {
        return [];
    }
    return firstNav.map(item => ({
        ...item,
        image: (item.image as { src: string; } | undefined)?.src,
        description: item.description as string,
        label: item.title,
        to: item.path,
        children: item.children?.filter(child => child.path !== item.path) || [],
        active: route.path.startsWith(item.path)
    }));
});
</script>

<template>
    <div>
        <UHeader
            title="Thèmes"
            to="/enseignements"
            mode="slideover"
        >
            <ClientOnly>
                <UNavigationMenu
                    :items="items"
                    :ui="{
                        list: 'gap-10',
                        link: 'gap-0',
                        linkTrailingIcon: 'hidden size-0'
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
                            :ui="{
                                body: 'lg:pr-4'
                            }"
                        >
                            <template #header>
                                <img
                                    :src="item.image"
                                    class="size-full object-cover object-center"
                                >
                            </template>
                        </UBlogPost>
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
        <NuxtPage :themes="items" />
    </div>
</template>

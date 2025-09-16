<script setup lang="ts">
const { data: navigation } = useAsyncData('navigation', () => queryCollectionNavigation('bible'), {
    transform: data => data.find(item => item.path === '/bible')?.children || []
})
</script>

<template>
    <div>
        <AppHeader />

        <UMain>
            <UContainer>
                <UPage>
                    <template #left>
                        <UPageAside>
                            <template #top>
                                <UContentSearchButton :collapsed="false" />
                            </template>

                            <UContentNavigation
                                :navigation="navigation"
                                highlight
                            />
                        </UPageAside>
                    </template>

                    <slot />
                </UPage>
            </UContainer>
        </UMain>

        <AppFooter />
    </div>
</template>

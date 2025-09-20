<script setup lang="ts">

</script>

<template>
    <div>
        <AppHeader />

        <UMain>
            <UContainer>
                <slot />
            </UContainer>
        </UMain>

        <AppFooter />
    </div>
</template>

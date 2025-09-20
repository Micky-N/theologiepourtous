<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

const route = useRoute()
const { user, isLoggedIn, logout } = useAuth()

const items = computed(() => [
    {
        label: 'Enseignements',
        to: '/enseignements',
        active: route.path.startsWith('/enseignements')
    },
    {
        label: 'Blog',
        to: '/blog',
        active: route.path.startsWith('/blog')
    },
    {
        label: 'Bible',
        to: '/bible',
        active: route.path.startsWith('/bible')
    },
    {
        label: 'À propos',
        to: '/about',
        active: route.path.startsWith('/about')
    }
])

const userMenuItems = computed(() => [
    [{
        label: 'Mon profil',
        icon: 'i-lucide-user',
        click: () => navigateTo('/bible/compare')
    }],
    [{
        label: 'Se déconnecter',
        icon: 'i-lucide-log-out',
        click: logout
    }]
])
</script>

<template>
    <UHeader>
        <template #left>
            <NuxtLink to="/">
                <AppLogo class="w-auto h-6 shrink-0" />
            </NuxtLink>
        </template>

        <UNavigationMenu
            :items="items"
            variant="link"
        />

        <template #right>
            <UColorModeButton />

            <template v-if="isLoggedIn">
                <UDropdownMenu
                    :items="userMenuItems"
                    :ui="{
                        content: 'w-48'
                    }"
                >
                    <UButton
                        :label="user?.name || 'Utilisateur'"
                        color="neutral"
                        variant="outline"
                        trailing-icon="i-lucide-chevron-down"
                        class="hidden lg:inline-flex"
                    />
                </UDropdownMenu>

                <UButton
                    icon="i-lucide-user"
                    color="neutral"
                    variant="ghost"
                    class="lg:hidden"
                />
            </template>

            <template v-else>
                <UButton
                    icon="i-lucide-log-in"
                    color="neutral"
                    variant="ghost"
                    to="/login"
                    class="lg:hidden"
                />

                <UButton
                    label="Se connecter"
                    color="neutral"
                    variant="outline"
                    to="/login"
                    class="hidden lg:inline-flex"
                />

                <UButton
                    label="S'inscrire"
                    color="neutral"
                    trailing-icon="i-lucide-arrow-right"
                    class="hidden lg:inline-flex"
                    to="/signup"
                />
            </template>
        </template>

        <template #body>
            <UNavigationMenu
                :items="items"
                orientation="vertical"
                class="-mx-2.5"
            />

            <USeparator class="my-6" />

            <template v-if="isLoggedIn">
                <div class="flex items-center justify-between mb-3 px-2">
                    <div class="flex flex-col">
                        <p class="text-sm font-medium text-gray-900 dark:text-white">
                            {{ user?.name }}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                            {{ user?.email }}
                        </p>
                    </div>
                </div>
                <UButton
                    label="Se déconnecter"
                    icon="i-lucide-log-out"
                    color="neutral"
                    variant="subtle"
                    block
                    @click="logout"
                />
            </template>

            <template v-else>
                <UButton
                    label="Se connecter"
                    color="neutral"
                    variant="subtle"
                    to="/login"
                    block
                    class="mb-3"
                />
                <UButton
                    label="S'inscrire"
                    color="neutral"
                    to="/signup"
                    block
                />
            </template>
        </template>
    </UHeader>
</template>

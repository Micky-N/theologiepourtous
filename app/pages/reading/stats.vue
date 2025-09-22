<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
        <!-- Navigation de retour -->
        <div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex items-center justify-between h-16">
                    <div class="flex items-center">
                        <NuxtLink
                            to="/bible"
                            class="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        >
                            <UIcon
                                name="i-lucide-arrow-left"
                                class="w-4 h-4"
                            />
                            Retour à la Bible
                        </NuxtLink>
                    </div>
                    <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
                        Statistiques de lecture
                    </h1>
                    <div />
                </div>
            </div>
        </div>

        <!-- Contenu -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ReadingStatsDashboard />
        </div>
    </div>
</template>

<script setup lang="ts">
// Configuration de la page
definePageMeta({
    middleware: 'auth',
    layout: 'default'
});

// Meta tags
useHead({
    title: 'Statistiques de lecture - Théologie pour tous',
    meta: [
        {
            name: 'description',
            content: 'Suivez votre progression dans l\'étude de la Bible avec des statistiques détaillées'
        }
    ]
});
</script>

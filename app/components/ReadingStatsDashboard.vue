<template>
    <div class="reading-stats-dashboard space-y-6">
        <!-- En-tête avec période -->
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                    Statistiques de lecture
                </h2>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Suivez votre progression dans l'étude biblique
                </p>
            </div>

            <USelectMenu
                v-model="selectedPeriod"
                :options="periodOptions"
                option-attribute="label"
                value-attribute="value"
                @change="loadStats"
            />
        </div>

        <!-- Chargement -->
        <div
            v-if="loading"
            class="flex justify-center py-12"
        >
            <UIcon
                name="i-lucide-loader-2"
                class="w-8 h-8 animate-spin"
            />
        </div>

        <!-- Contenu principal -->
        <div
            v-else-if="stats"
            class="space-y-6"
        >
            <!-- Cartes de résumé -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Temps total"
                    :value="formattedTime(stats.summary.totalReadingTime)"
                    icon="i-lucide-clock"
                    color="blue"
                />
                <StatsCard
                    title="Sessions"
                    :value="stats.summary.totalSessions.toString()"
                    icon="i-lucide-book-open"
                    color="green"
                />
                <StatsCard
                    title="Chapitres lus"
                    :value="stats.summary.totalChaptersRead.toString()"
                    icon="i-lucide-scroll-text"
                    color="purple"
                />
                <StatsCard
                    title="Série actuelle"
                    :value="`${stats.summary.currentStreak} jours`"
                    icon="i-lucide-flame"
                    color="orange"
                />
            </div>

            <!-- Graphiques -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Graphique temps de lecture -->
                <UCard>
                    <template #header>
                        <h3 class="text-lg font-semibold">
                            Temps de lecture quotidien
                        </h3>
                    </template>
                    <ReadingTimeChart :data="stats.dailyStats" />
                </UCard>

                <!-- Graphique versets lus -->
                <UCard>
                    <template #header>
                        <h3 class="text-lg font-semibold">
                            Progression des versets
                        </h3>
                    </template>
                    <VersesReadChart :data="stats.dailyStats" />
                </UCard>
            </div>

            <!-- Heures préférées et moyennes -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Heures préférées -->
                <UCard>
                    <template #header>
                        <h3 class="text-lg font-semibold">
                            Heures préférées
                        </h3>
                    </template>
                    <TimePreferencesChart :data="stats.timePreferences" />
                </UCard>

                <!-- Moyennes -->
                <UCard>
                    <template #header>
                        <h3 class="text-lg font-semibold">
                            Moyennes
                        </h3>
                    </template>
                    <div class="space-y-4">
                        <div class="flex justify-between items-center">
                            <span class="text-sm text-gray-600 dark:text-gray-400">
                                Temps/jour
                            </span>
                            <span class="font-medium">
                                {{ formattedTime(stats.summary.averages.readingTimePerDay) }}
                            </span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-sm text-gray-600 dark:text-gray-400">
                                Chapitres/session
                            </span>
                            <span class="font-medium">
                                {{ Math.round(stats.summary.averages.chaptersPerSession) }}
                            </span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-sm text-gray-600 dark:text-gray-400">
                                Plus longue série
                            </span>
                            <span class="font-medium">
                                {{ stats.summary.longestStreak }} jours
                            </span>
                        </div>
                    </div>
                </UCard>

                <!-- Livres les plus lus -->
                <UCard>
                    <template #header>
                        <h3 class="text-lg font-semibold">
                            Top livres
                        </h3>
                    </template>
                    <div class="space-y-3">
                        <div
                            v-for="(book, index) in stats.topBooks.slice(0, 5)"
                            :key="typeof book.name === 'string' ? book.name : book.name"
                            class="flex items-center gap-3"
                        >
                            <div class="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                <span class="text-xs font-medium text-blue-600 dark:text-blue-400">
                                    {{ index + 1 }}
                                </span>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium truncate">
                                    {{ book.name }}
                                </p>
                                <p class="text-xs text-gray-500">
                                    {{ book.sessions }} sessions • {{ formattedTime(book.totalTime) }}
                                </p>
                            </div>
                        </div>
                    </div>
                </UCard>
            </div>

            <!-- Progression par livre -->
            <UCard>
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3 class="text-lg font-semibold">
                            Progression par livre
                        </h3>
                        <div class="flex gap-2">
                            <UButton
                                :variant="showTestament === 'all' ? 'solid' : 'ghost'"
                                size="xs"
                                @click="showTestament = 'all'"
                            >
                                Tous
                            </UButton>
                            <UButton
                                :variant="showTestament === 'OLD' ? 'solid' : 'ghost'"
                                size="xs"
                                @click="showTestament = 'OLD'"
                            >
                                AT
                            </UButton>
                            <UButton
                                :variant="showTestament === 'NEW' ? 'solid' : 'ghost'"
                                size="xs"
                                @click="showTestament = 'NEW'"
                            >
                                NT
                            </UButton>
                        </div>
                    </div>
                </template>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div
                        v-for="progress in filteredBookProgress"
                        :key="typeof progress.book === 'string' ? progress.book : progress.book.code"
                        class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                        <div class="flex items-center justify-between mb-2">
                            <h4 class="font-medium text-sm">
                                {{ typeof progress.book === 'string' ? progress.book : progress.book.name }}
                            </h4>
                            <span class="text-xs text-gray-500">
                                {{ progress.completionPercentage }}%
                            </span>
                        </div>

                        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                            <div
                                class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                :style="{ width: `${progress.completionPercentage}%` }"
                            />
                        </div>

                        <div
                            v-if="progress.isCompleted"
                            class="mt-2 flex items-center gap-1 text-green-600 dark:text-green-400"
                        >
                            <UIcon
                                name="i-lucide-check-circle"
                                class="w-3 h-3"
                            />
                            <span class="text-xs">Terminé</span>
                        </div>
                    </div>
                </div>
            </UCard>
        </div>

        <!-- Erreur -->
        <UAlert
            v-else-if="error"
            color="error"
            variant="soft"
            :title="error"
        />
    </div>
</template>

<script setup lang="ts">
import type { ReadingStatsResponse } from '~/types';

// Configuration de la page
definePageMeta({
    middlewares: 'auth',
    layout: 'default'
});

// État
const loading = ref(true);
const error = ref('');
const stats = ref<ReadingStatsResponse | null>(null);
const selectedPeriod = ref('week');
const showTestament = ref<'all' | 'OLD' | 'NEW'>('all');

// Options de période
const periodOptions = [
    { label: 'Aujourd\'hui', value: 'day' },
    { label: '7 derniers jours', value: 'week' },
    { label: '30 derniers jours', value: 'month' },
    { label: 'Cette année', value: 'year' },
    { label: 'Tout', value: 'all' }
];

// Progression filtrée par testament
const filteredBookProgress = computed(() => {
    if (!stats.value) return [];

    if (showTestament.value === 'all') {
        return stats.value.bookProgress;
    }

    return stats.value.bookProgress.filter(
        progress => typeof progress.book === 'object' && progress.book.testament === showTestament.value
    );
});

// Charger les statistiques
const loadStats = async () => {
    try {
        loading.value = true;
        error.value = '';

        stats.value = await $fetch<ReadingStatsResponse>('/api/reading/stats', {
            query: {
                period: selectedPeriod.value
            }
        });
    } catch (err) {
        error.value = 'Erreur lors du chargement des statistiques';
        console.error(err);
    } finally {
        loading.value = false;
    }
};

// Utilitaires
const formattedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
        return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
    } else if (minutes > 0) {
        return `${minutes}m`;
    } else {
        return `${seconds}s`;
    }
};

// Chargement initial
onMounted(() => {
    loadStats();
});
</script>

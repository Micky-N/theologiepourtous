<template>
    <UMain>
        <UContainer>
            <div class="space-y-6 py-6">
                <!-- En-tête avec période -->
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                            Statistiques de lecture
                        </h1>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Suivez votre progression dans l'étude biblique
                        </p>
                    </div>

                    <USelectMenu
                        v-model="selectedPeriod"
                        :items="periodOptions"
                        label-key="label"
                        value-key="value"
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
                    <div class="flex items-center justify-end gap-2">
                        <UButton
                            icon="i-lucide-file-down"
                            variant="outline"
                            size="sm"
                            @click="exportCSV"
                        >
                            Export CSV
                        </UButton>
                        <UButton
                            icon="i-lucide-file-text"
                            variant="outline"
                            size="sm"
                            @click="exportPDF"
                        >
                            Export PDF
                        </UButton>
                    </div>
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
                        <UCard>
                            <template #header>
                                <h3 class="text-lg font-semibold">
                                    Temps de lecture quotidien
                                </h3>
                            </template>
                            <ReadingTimeChart :data="stats.dailyStats" />
                        </UCard>

                        <UCard>
                            <template #header>
                                <h3 class="text-lg font-semibold">
                                    Progression des chapitres
                                </h3>
                            </template>
                            <VersesReadChart :data="stats.dailyStats" />
                        </UCard>
                    </div>

                    <!-- Heures préférées et moyennes -->
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                            <div class="grid grid-cols-1 gap-4">
                                <div class="flex justify-between items-center">
                                    <span class="text-sm text-gray-600 dark:text-gray-400">
                                        Temps/jour (moyen)
                                    </span>
                                    <span class="font-medium">
                                        {{ formattedTime(stats.summary.averages.readingTimePerDay) }}
                                    </span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-sm text-gray-600 dark:text-gray-400">
                                        Chapitres/session (moyen)
                                    </span>
                                    <span class="font-medium">
                                        {{ Math.round(stats.summary.averages.chaptersPerSession || 0) }}
                                    </span>
                                </div>
                            </div>
                        </UCard>

                        <UCard>
                            <template #header>
                                <h3 class="text-lg font-semibold">
                                    Top livres
                                </h3>
                            </template>
                            <div
                                v-if="stats.topBooks.length > 0"
                                class="space-y-3"
                            >
                                <div
                                    v-for="(book, index) in stats.topBooks.slice(0, 5)"
                                    :key="book.name + '-' + index"
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
                            <div
                                v-else
                                class="text-sm text-gray-500"
                            >
                                Aucune donnée pour le moment.
                            </div>
                        </UCard>
                    </div>

                    <!-- Progression par livre -->
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

                        <div
                            v-if="filteredBookProgress.length > 0"
                            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                        >
                            <div
                                v-for="progress in filteredBookProgress"
                                :key="progress.book.code"
                                class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                            >
                                <div class="flex items-center justify-between mb-2">
                                    <h4 class="font-medium text-sm">
                                        {{ progress.book.name }}
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
                        <div
                            v-else
                            class="text-sm text-gray-500"
                        >
                            Aucune progression disponible pour cette période.
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
        </UContainer>
    </UMain>
</template>

<script lang="ts" setup>
import type { ReadingStatsResponse } from '~/types';

definePageMeta({
    middleware: 'auth',
    layout: 'default'
});

// État
const loading = ref(true);
const error = ref('');
const stats = ref<ReadingStatsResponse | null>(null);
const selectedPeriod = ref<'7days' | '30days' | '90days' | '365days'>('30days');
const showTestament = ref<'all' | 'OLD' | 'NEW'>('all');

// Options de période compatibles avec l'API
const periodOptions = [
    { label: '7 derniers jours', value: '7days' },
    { label: '30 derniers jours', value: '30days' },
    { label: '90 derniers jours', value: '90days' },
    { label: 'Cette année', value: '365days' }
];

// Progression filtrée par testament
const filteredBookProgress = computed(() => {
    if (!stats.value) return [] as NonNullable<ReadingStatsResponse['bookProgress']>;

    if (showTestament.value === 'all') {
        return stats.value.bookProgress;
    }

    return stats.value.bookProgress.filter(progress => progress.book.testament === showTestament.value);
});

// Charger les statistiques
const loadStats = async () => {
    try {
        loading.value = true;
        error.value = '';

        stats.value = await $fetch<ReadingStatsResponse>('/api/reading/stats', {
            query: { period: selectedPeriod.value }
        });
    } catch (err) {
        error.value = 'Erreur lors du chargement des statistiques';
        console.error(err);
        stats.value = null;
    } finally {
        loading.value = false;
    }
};

watch(selectedPeriod, () => {
    loadStats();
});

// Utilitaires
const formattedTime = (seconds: number) => {
    const s = Math.max(0, Math.floor(seconds || 0));
    const hours = Math.floor(s / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const secs = s % 60;

    if (hours > 0) {
        return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
    } else if (minutes > 0) {
        return `${minutes}m${secs > 0 ? ` ${secs}s` : ''}`;
    } else {
        return `${secs}s`;
    }
};

// Chargement initial
onMounted(() => {
    loadStats();
});

// Export helpers
function exportCSV() {
    if (!stats.value) return;
    const rows: string[] = [];
    rows.push('Date,Temps total (s),Chapitres lus,Versets lus,Sessions');
    for (const d of stats.value.dailyStats) {
        const day = new Date(d.date).toISOString().slice(0, 10);
        rows.push(`${day},${d.totalReadingTime},${d.chaptersRead},${d.versesRead ?? 0},${d.sessionsCount}`);
    }
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reading_stats.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function exportPDF() {
    if (!stats.value) return;
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    let y = 10;
    doc.setFontSize(14);
    doc.text('Statistiques de lecture', 10, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`Période: ${selectedPeriod.value}`, 10, y);
    y += 6;
    doc.text(`Temps total: ${formattedTime(stats.value.summary.totalReadingTime)}`, 10, y);
    y += 6;
    doc.text(`Sessions: ${stats.value.summary.totalSessions}`, 10, y);
    y += 6;
    doc.text(`Chapitres lus: ${stats.value.summary.totalChaptersRead}`, 10, y);
    y += 10;
    // Ajout d'un tableau avec en-tête
    const tableColumns = ['Date', 'Temps (s)', 'Chapitres', 'Versets', 'Sessions'];
    const tableRows = stats.value.dailyStats.slice(-20).map(d => [
        new Date(d.date).toISOString().slice(0, 10),
        d.totalReadingTime.toString(),
        d.chaptersRead.toString(),
        (d.versesRead ?? 0).toString(),
        d.sessionsCount.toString()
    ]);

    // Largeurs de colonnes
    const colWidths = [30, 30, 30, 30, 30];
    let startY = y;

    // En-tête
    tableColumns.forEach((col, i) => {
        doc.text(col, 10 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), startY);
    });
    startY += 6;

    // Lignes
    tableRows.forEach((row) => {
        row.forEach((cell, i) => {
            doc.text(cell, 10 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), startY);
        });
        startY += 6;
        if (startY > 280) {
            doc.addPage();
            startY = 10;
        }
    });
    y = startY + 4;
    doc.save('reading_stats.pdf');
}
</script>

<style scoped>
</style>

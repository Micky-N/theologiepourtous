<template>
    <div>
        <apexchart
            v-if="series[0]?.data?.length"
            type="bar"
            height="260"
            :options="chartOptions"
            :series="series"
        />
        <div
            v-else
            class="text-sm text-gray-500"
        >
            Aucune donnée.
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ReadingStats } from '~/types';

const props = defineProps<{ data: ReadingStats[]; }>();

const categories = computed(() => props.data.map(d => formatDate(d.date)));
const chapters = computed(() => props.data.map(d => d.chaptersRead || 0));

const series = computed(() => [{ name: 'Chapitres', data: chapters.value }]);

const chartOptions = computed(() => ({
    chart: { toolbar: { show: false }, sparkline: { enabled: false }, foreColor: 'inherit' },
    grid: { strokeDashArray: 3 },
    xaxis: { categories: categories.value, labels: { rotate: -45 } },
    yaxis: { title: { text: 'chap.' } },
    colors: ['#7c3aed'],
    tooltip: { y: { formatter: (val: number) => `${val} chap.` } }
}));

function formatDate(date: Date) {
    const d = new Date(date);
    return d.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' });
}
</script>

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
const minutes = computed(() => props.data.map(d => Math.round((d.totalReadingTime || 0) / 60)));

const series = computed(() => [{ name: 'Minutes', data: minutes.value }]);

const chartOptions = computed(() => ({
    chart: { toolbar: { show: false }, sparkline: { enabled: false }, foreColor: 'inherit' },
    grid: { strokeDashArray: 3 },
    xaxis: { categories: categories.value, labels: { rotate: -45 } },
    yaxis: { title: { text: 'min' } },
    colors: ['#2563eb'],
    tooltip: { y: { formatter: (val: number) => `${val} min` } }
}));

function formatDate(date: Date) {
    const d = new Date(date);
    return d.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' });
}
</script>

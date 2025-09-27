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
const props = defineProps<{ data: Record<string, number> }>();

const labels = computed(() => Array.from({ length: 24 }, (_, i) => String(i)));
const counts = computed(() => labels.value.map(h => props.data?.[h] || 0));

const series = computed(() => [{ name: 'Sessions', data: counts.value }]);

const chartOptions = computed(() => ({
    chart: { toolbar: { show: false }, foreColor: 'inherit' },
    grid: { strokeDashArray: 3 },
    xaxis: { categories: labels.value, title: { text: 'Heure' } },
    yaxis: { title: { text: 'sessions' } },
    colors: ['#16a34a'],
    plotOptions: { bar: { columnWidth: '60%' } },
    tooltip: { y: { formatter: (val: number) => `${val} sessions` } }
}));
</script>

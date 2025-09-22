<template>
    <div class="max-w-7xl mx-auto p-8 space-y-12">
        <div class="text-center mb-12">
            <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Charte Graphique - Théologie pour Tous
            </h1>
            <p class="text-xl text-gray-600 dark:text-gray-300">
                Palette de couleurs orientée bleu avec nuances théologiques
            </p>
        </div>

        <!-- Palette Principale -->
        <section>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Palette Principale
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Blue Primary -->
                <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                    <h3 class="text-lg font-semibold mb-4 text-blue-600">
                        Primary (Blue)
                    </h3>
                    <div class="space-y-2">
                        <div
                            v-for="shade in blueShades"
                            :key="shade.name"
                            :style="`background-color: var(--color-blue-${shade.value})`"
                            class="h-12 rounded flex items-center px-4 text-white"
                        >
                            <span class="text-sm font-medium">
                                {{ shade.name }} - {{ shade.hex }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Indigo Secondary -->
                <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                    <h3 class="text-lg font-semibold mb-4 text-indigo-600">
                        Secondary (Indigo)
                    </h3>
                    <div class="space-y-2">
                        <div
                            v-for="shade in indigoShades"
                            :key="shade.name"
                            :style="`background-color: var(--color-indigo-${shade.value})`"
                            class="h-12 rounded flex items-center px-4 text-white"
                        >
                            <span class="text-sm font-medium">
                                {{ shade.name }} - {{ shade.hex }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Sky Accent -->
                <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                    <h3 class="text-lg font-semibold mb-4 text-sky-600">
                        Accent (Sky)
                    </h3>
                    <div class="space-y-2">
                        <div
                            v-for="shade in skyShades"
                            :key="shade.name"
                            :style="`background-color: var(--color-sky-${shade.value})`"
                            class="h-12 rounded flex items-center px-4 text-white"
                        >
                            <span class="text-sm font-medium">
                                {{ shade.name }} - {{ shade.hex }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Couleurs Théologiques -->
        <section>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Couleurs Théologiques
            </h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div
                    v-for="color in theologicalColors"
                    :key="color.name"
                    class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg text-center"
                >
                    <div
                        :class="`w-16 h-16 rounded-full mx-auto mb-3 ${color.bg}`"
                    />
                    <h4 :class="`font-semibold ${color.text}`">
                        {{ color.name }}
                    </h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {{ color.meaning }}
                    </p>
                    <code class="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded mt-2 block">
                        {{ color.value }}
                    </code>
                </div>
            </div>
        </section>

        <!-- Couleurs Fonctionnelles -->
        <section>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Couleurs Fonctionnelles
            </h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div
                    v-for="color in functionalColors"
                    :key="color.name"
                    class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg"
                >
                    <div class="flex items-center mb-3">
                        <div :class="`w-4 h-4 rounded mr-3 ${color.bg}`" />
                        <span class="font-semibold text-gray-900 dark:text-white">
                            {{ color.name }}
                        </span>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-300">
                        {{ color.usage }}
                    </p>
                    <UButton
                        :color="(color.name.toLowerCase() as 'primary' | 'secondary' | 'success' | 'warning' | 'error')"
                        size="sm"
                        class="mt-3 w-full"
                    >
                        Exemple
                    </UButton>
                </div>
            </div>
        </section>

        <!-- Dégradés -->
        <section>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Dégradés Recommandés
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                    v-for="gradient in gradients"
                    :key="gradient.name"
                    :class="`h-32 rounded-xl p-4 flex items-end bg-gradient-to-r ${gradient.value}`"
                >
                    <div class="text-white">
                        <h4 class="font-semibold">
                            {{ gradient.name }}
                        </h4>
                        <code class="text-xs opacity-80">
                            {{ gradient.value }}
                        </code>
                    </div>
                </div>
            </div>
        </section>

        <!-- Exemples d'utilisation -->
        <section>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Exemples d'Utilisation
            </h2>
            <div class="space-y-6">
                <!-- Boutons -->
                <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                    <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                        Boutons
                    </h3>
                    <div class="flex flex-wrap gap-4">
                        <UButton color="primary">
                            Principal
                        </UButton>
                        <UButton color="secondary">
                            Secondaire
                        </UButton>
                        <UButton color="success">
                            Succès
                        </UButton>
                        <UButton color="warning">
                            Attention
                        </UButton>
                        <UButton color="error">
                            Erreur
                        </UButton>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
// Données pour les palettes de couleurs
const blueShades = [
    { name: 'blue-400', value: '400', hex: '#60a5fa' },
    { name: 'blue-500', value: '500', hex: '#3b82f6' },
    { name: 'blue-600', value: '600', hex: '#2563eb' },
    { name: 'blue-700', value: '700', hex: '#1d4ed8' }
];

const indigoShades = [
    { name: 'indigo-400', value: '400', hex: '#818cf8' },
    { name: 'indigo-500', value: '500', hex: '#6366f1' },
    { name: 'indigo-600', value: '600', hex: '#4f46e5' },
    { name: 'indigo-700', value: '700', hex: '#4338ca' }
];

const skyShades = [
    { name: 'sky-400', value: '400', hex: '#38bdf8' },
    { name: 'sky-500', value: '500', hex: '#0ea5e9' },
    { name: 'sky-600', value: '600', hex: '#0284c7' },
    { name: 'sky-700', value: '700', hex: '#0369a1' }
];

const theologicalColors = [
    { name: 'Divine', meaning: 'Divinité', bg: 'bg-violet-600', text: 'text-violet-600', value: 'violet-600' },
    { name: 'Sacred', meaning: 'Sacré', bg: 'bg-purple-600', text: 'text-purple-600', value: 'purple-600' },
    { name: 'Wisdom', meaning: 'Sagesse', bg: 'bg-yellow-500', text: 'text-yellow-600', value: 'yellow-500' },
    { name: 'Peace', meaning: 'Paix', bg: 'bg-teal-500', text: 'text-teal-600', value: 'teal-500' },
    { name: 'Grace', meaning: 'Grâce', bg: 'bg-rose-400', text: 'text-rose-500', value: 'rose-400' },
    { name: 'Truth', meaning: 'Vérité', bg: 'bg-blue-700', text: 'text-blue-700', value: 'blue-700' },
    { name: 'Faith', meaning: 'Foi', bg: 'bg-indigo-500', text: 'text-indigo-600', value: 'indigo-500' },
    { name: 'Hope', meaning: 'Espoir', bg: 'bg-sky-400', text: 'text-sky-600', value: 'sky-400' }
];

const functionalColors = [
    { name: 'Success', usage: 'Messages de succès', bg: 'bg-emerald-500' },
    { name: 'Warning', usage: 'Alertes et attention', bg: 'bg-amber-500' },
    { name: 'Error', usage: 'Erreurs et suppression', bg: 'bg-red-500' },
    { name: 'Info', usage: 'Information et aide', bg: 'bg-cyan-500' }
];

const gradients = [
    { name: 'Primary', value: 'from-blue-600 to-indigo-600' },
    { name: 'Divine', value: 'from-violet-500 to-purple-600' },
    { name: 'Peaceful', value: 'from-teal-400 to-blue-500' },
    { name: 'Spiritual', value: 'from-indigo-600 to-violet-600' }
];

// Métadonnées de la page
useSeoMeta({
    title: 'Charte Graphique - Théologie pour Tous',
    description: 'Palette de couleurs et guide de style pour la plateforme de formation théologique'
});
</script>

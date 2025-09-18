<template>
    <div
        v-if="homeData"
        class="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100 dark:from-gray-900 dark:to-gray-800"
    >
        <!-- Hero Section -->
        <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
            <!-- Background Pattern -->
            <div class="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-indigo-950">
                <img
                    src="/images/home.jpg"
                    alt=""
                    class="w-full h-full object-center"
                >
                <div class="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/10 to-transparent dark:from-gray-900/90 dark:via-gray-900/50" />
            </div>

            <div class="relative z-10 max-w-6xl mx-auto px-6 text-center">
                <div class="mb-8">
                    <div class="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
                        <UIcon
                            :name="homeData.hero.badge.icon"
                            class="w-4 h-4 mr-2"
                        />
                        {{ homeData.hero.badge.text }}
                    </div>
                </div>

                <h1 class="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    {{ homeData.hero.title }}
                    <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                        {{ homeData.hero.titleHighlight }}
                    </span>
                </h1>

                <p class="text-xl md:text-2xl text-white mb-8 max-w-3xl mx-auto leading-relaxed">
                    {{ homeData.hero.subtitle }}
                </p>

                <div class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                    <UButton
                        size="xl"
                        color="primary"
                        variant="solid"
                        :to="homeData.hero.primaryCta.link"
                    >
                        <UIcon
                            :name="homeData.hero.primaryCta.icon"
                            class="w-5 h-5"
                        />
                        {{ homeData.hero.primaryCta.text }}
                    </UButton>

                    <UButton
                        size="xl"
                        color="neutral"
                        variant="outline"
                        :to="homeData.hero.secondaryCta.link"
                    >
                        <UIcon
                            :name="homeData.hero.secondaryCta.icon"
                            class="w-5 h-5"
                        />
                        {{ homeData.hero.secondaryCta.text }}
                    </UButton>
                </div>
            </div>

            <!-- Scroll indicator -->
            <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                <UIcon
                    name="i-lucide-chevron-down"
                    class="w-6 h-6 text-gray-400"
                />
            </div>
        </section>

        <!-- Mission/Vision Section -->
        <section class="py-20 bg-white dark:bg-gray-900">
            <div class="max-w-7xl mx-auto px-6">
                <div class="text-center mb-16">
                    <div class="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
                        <UIcon
                            :name="homeData.mission.badge.icon"
                            class="w-4 h-4 mr-2"
                        />
                        {{ homeData.mission.badge.text }}
                    </div>
                    <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                        {{ homeData.mission.title }}
                    </h2>
                    <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        {{ homeData.mission.subtitle }}
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div
                        v-for="(pillar, index) in homeData.mission.pillars"
                        :key="index"
                        class="text-center group hover:scale-105 transition-transform duration-300"
                    >
                        <div
                            :class="[
                                'w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center transition-colors duration-300',
                                `bg-${pillar.color}-100 dark:bg-${pillar.color}-900/30 group-hover:bg-${pillar.color}-200 dark:group-hover:bg-${pillar.color}-900/50`
                            ]"
                        >
                            <UIcon
                                :name="pillar.icon"
                                :class="`w-8 h-8 text-${pillar.color}-600 dark:text-${pillar.color}-400`"
                            />
                        </div>
                        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            {{ pillar.title }}
                        </h3>
                        <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
                            {{ pillar.description }}
                        </p>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-8 md:p-12">
                    <div class="text-center">
                        <h3 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            "{{ homeData.mission.verse.text }}"
                        </h3>
                        <p class="text-xl text-gray-600 dark:text-gray-300 mb-2">
                            {{ homeData.mission.verse.reference }}
                        </p>
                        <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            {{ homeData.mission.verse.commentary }}
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Enseignements Section -->
        <section class="py-20 bg-gray-50 dark:bg-gray-800">
            <div class="max-w-7xl mx-auto px-6">
                <div class="text-center mb-16">
                    <div class="inline-flex items-center px-4 py-2 rounded-full bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 text-sm font-medium mb-6">
                        <UIcon
                            :name="homeData.teachings.badge.icon"
                            class="w-4 h-4 mr-2"
                        />
                        {{ homeData.teachings.badge.text }}
                    </div>
                    <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                        {{ homeData.teachings.title }}
                    </h2>
                    <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        {{ homeData.teachings.subtitle }}
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <!-- Course Cards -->
                    <div
                        v-for="(course, index) in homeData.teachings.courses"
                        :key="index"
                        class="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group flex flex-col justify-between"
                    >
                        <img
                            :src="getTheme(course.name)?.image.src as string || course.image"
                            :alt="course.title"
                            class="w-full aspect-video object-cover object-center"
                        >
                        <div class="p-6 h-full flex flex-col justify-between">
                            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                {{ course.title }}
                            </h3>
                            <p class="flex-1 text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                                {{ course.description }}
                            </p>
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-gray-500 dark:text-gray-400">
                                    {{ getTheme(course.name)?.children?.length || 0 }} leçon{{ (getTheme(course.name)?.children?.length || 0) > 1 ? 's' : '' }}
                                </span>
                                <UButton
                                    variant="ghost"
                                    color="neutral"
                                    :to="course.link"
                                >
                                    Explorer
                                </UButton>
                            </div>
                        </div>
                    </div>

                    <!-- All Courses Card -->
                    <div class="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group text-white">
                        <div class="p-6 h-full flex flex-col justify-center items-center text-center">
                            <UIcon
                                name="i-lucide-library"
                                class="w-16 h-16 mb-4 opacity-90"
                            />
                            <h3 class="text-2xl font-bold mb-3">
                                {{ homeData.teachings.allCoursesCard.title }}
                            </h3>
                            <p class="mb-6 leading-relaxed opacity-90">
                                {{ homeData.teachings.allCoursesCard.description }}
                            </p>
                            <UButton
                                variant="solid"
                                color="neutral"
                                :to="homeData.teachings.allCoursesCard.link"
                                class="bg-white text-indigo-600 hover:bg-gray-100"
                            >
                                {{ homeData.teachings.allCoursesCard.cta }}
                            </UButton>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Témoignages Section -->
        <section class="py-20 bg-white dark:bg-gray-900">
            <div class="max-w-7xl mx-auto px-6">
                <div class="text-center mb-16">
                    <div class="inline-flex items-center px-4 py-2 rounded-full bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-6">
                        <UIcon
                            :name="homeData.testimonials.badge.icon"
                            class="w-4 h-4 mr-2"
                        />
                        {{ homeData.testimonials.badge.text }}
                    </div>
                    <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                        {{ homeData.testimonials.title }}
                    </h2>
                    <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        {{ homeData.testimonials.subtitle }}
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <!-- Testimonial Cards -->
                    <div
                        v-for="(review, index) in homeData.testimonials.reviews"
                        :key="index"
                        class="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 hover:shadow-lg transition-all duration-300"
                    >
                        <div class="flex items-center mb-6">
                            <img
                                :src="review.image"
                                :alt="review.name"
                                class="w-16 h-16 rounded-full object-cover mr-4"
                            >
                            <div>
                                <h4 class="text-lg font-semibold text-gray-900 dark:text-white">
                                    {{ review.name }}
                                </h4>
                                <p class="text-gray-600 dark:text-gray-400">
                                    {{ review.role }}
                                </p>
                            </div>
                        </div>
                        <div class="mb-6">
                            <UIcon
                                name="i-lucide-quote"
                                class="w-8 h-8 text-purple-400 opacity-50"
                            />
                        </div>
                        <p class="text-gray-700 dark:text-gray-300 leading-relaxed italic">
                            "{{ review.quote }}"
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA Final Section -->
        <USeparator class="border-gray-200 dark:border-gray-700" />

        <!-- CTA Section avec design moderne -->
        <UPageCTA
            variant="naked"
            class="relative py-24"
        >
            <template #default>
                <div class="absolute inset-0">
                    <StarsBg />
                </div>
                <div class="absolute inset-0">
                    <div
                        class="h-full w-full opacity-10"
                        style="background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0); background-size: 30px 30px;"
                    />
                </div>

                <div class="relative z-10 text-center">
                    <h2 class="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                        {{ homeData.cta.title }}
                        <span class="text-secondary">
                            {{ homeData.cta.titleHighlight }}
                        </span>
                    </h2>

                    <p class="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed">
                        {{ homeData.cta.subtitle }}
                    </p>
                    <div class="flex flex-col sm:flex-row gap-4 justify-center">
                        <UButton
                            size="xl"
                            color="secondary"
                            variant="solid"
                            :to="homeData.cta.primaryButton.link"
                        >
                            <UIcon
                                :name="homeData.cta.primaryButton.icon"
                                class="w-6 h-6 mr-3"
                            />
                            {{ homeData.cta.primaryButton.text }}
                        </UButton>
                        <UButton
                            size="xl"
                            color="neutral"
                            variant="outline"
                            :to="homeData.cta.secondaryButton.link"
                        >
                            <UIcon
                                :name="homeData.cta.secondaryButton.icon"
                                class="w-6 h-6 mr-3"
                            />
                            {{ homeData.cta.secondaryButton.text }}
                        </UButton>
                    </div>
                </div>
            </template>
        </UPageCTA>
    </div>
    <div
        v-else
        class="min-h-screen flex items-center justify-center"
    >
        <div class="text-center">
            <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4" />
            <p class="text-gray-600 dark:text-gray-400">
                Chargement...
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { TeachingCollectionItem, ThemesCollectionItem } from '@nuxt/content'

const route = useRoute()
const { data: homeData } = await useAsyncData(route.path, () => queryCollection('index').first())
const { data: themes } = await useAsyncData('posts', () => queryCollectionNavigation('themes', ['image', 'slug']))

if (!homeData.value) {
    throw createError({ statusCode: 404, statusMessage: 'Page non trouvée' })
}
// Page metadata
useSeoMeta({
    title: homeData.value.seo.title,
    description: homeData.value.seo.description,
    ogTitle: homeData.value.seo.ogTitle,
    ogDescription: homeData.value.seo.ogDescription,
    ogImage: homeData.value.seo.ogImage
})

const getTheme = (themeName: string) => {
    return themes.value?.[0]?.children?.find(theme => theme.slug === themeName) as ThemesCollectionItem & { children: TeachingCollectionItem[] } | undefined
}
</script>

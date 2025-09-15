<script setup lang="ts">
const { data: page } = await useAsyncData('index', () => queryCollection('index').first())

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description

useSeoMeta({
    titleTemplate: '',
    title,
    ogTitle: title,
    description,
    ogDescription: description
})
</script>

<template>
    <div v-if="page">
        <!-- Hero Section avec gradient et motifs -->
        <UPageHero
            :title="page.title"
            :description="page.description"
            :links="page.hero.links"
        >
            <template #top>
                <HeroBackground />
                <StarsBg />
            </template>

            <template #title>
                <MDC
                    :value="page.title"
                    unwrap="p"
                />
            </template>

            <!-- Image hero théologique -->
            <div class="relative mx-auto w-full">
                <div class="relative rounded-2xl overflow-hidden shadow-lg">
                    <NuxtImg
                        src="/images/theologie.jpg"
                        alt="Étude théologique - Découverte de la Bible"
                        class="w-full aspect-video object-cover"
                    />
                </div>
                <!-- Éléments décoratifs -->
                <div class="absolute -top-12 -right-6 w-24 h-24 bg-primary-500/20 rounded-full blur-xl" />
                <div class="absolute -bottom-6 -left-6 w-32 h-32 bg-primary-600/20 rounded-full blur-xl" />
            </div>
        </UPageHero>

        <!-- Sections principales -->
        <UPageSection
            v-for="(section, index) in page.sections"
            :key="index"
            :title="section.title"
            :description="section.description"
            :orientation="section.orientation"
            :reverse="section.reverse"
            :ui="{
                container: 'py-12 sm:py-12 lg:py-24'
            }"
        >
            <template #headline>
                <UIcon
                    :name="index === 0 ? 'i-lucide-book-open-text' : 'i-lucide-graduation-cap'"
                    class="w-6 h-6 text-primary-500"
                />
            </template>

            <!-- Grille de fonctionnalités avec cartes améliorées -->
            <UPageGrid class="gap-8">
                <UPageCard
                    v-for="(feature, featureIndex) in section.features"
                    :key="featureIndex"
                    :title="feature.title"
                    :description="feature.description"
                    :icon="feature.icon"
                    class="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-l-4 border-primary-500/20 hover:border-primary-500"
                    spotlight
                >
                    <template #icon>
                        <div class="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 group-hover:bg-primary-500 group-hover:text-white transition-all duration-300">
                            <UIcon
                                :name="feature.icon"
                                class="w-6 h-6 text-primary-500 group-hover:text-white"
                            />
                        </div>
                    </template>
                </UPageCard>
            </UPageGrid>

            <!-- Image illustrative pour chaque section -->
            <div class="relative w-full">
                <div class="relative rounded-xl overflow-hidden shadow-lg">
                    <NuxtImg
                        v-if="index === 0"
                        src="/images/christologie.jpg"
                        alt="Fondements de la foi chrétienne"
                        class="w-full aspect-video object-cover"
                    />
                    <NuxtImg
                        v-else
                        src="/images/pneumatologie.jpg"
                        alt="Croissance spirituelle"
                        class="w-full aspect-video object-cover"
                    />
                    <div class="absolute inset-0 bg-primary-900/10" />
                </div>
            </div>
        </UPageSection>

        <!-- Section des fonctionnalités principales -->
        <UPageSection
            :title="page.features.title"
            :description="page.features.description"
            class="bg-gradient-to-br from-gray-50 to-primary-50/30 dark:from-gray-900 dark:to-primary-900/10"
            :ui="{
                container: 'py-12 sm:py-12 lg:py-24'
            }"
        >
            <template #headline>
                <div class="flex justify-center">
                    <UBadge
                        label="Nos Ressources"
                        variant="subtle"
                        class="mx-auto bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
                    />
                </div>
            </template>

            <UPageGrid class="gap-8 lg:grid-cols-3">
                <UPageCard
                    v-for="(item, index) in page.features.items"
                    :key="index"
                    v-bind="item"
                    class="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50"
                    spotlight
                >
                    <template #icon>
                        <div class="relative">
                            <div class="p-4 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 group-hover:from-primary-600 group-hover:to-primary-700 transition-all duration-300">
                                <UIcon
                                    :name="item.icon"
                                    class="w-7 h-7 text-white"
                                />
                            </div>
                            <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-300" />
                        </div>
                    </template>
                </UPageCard>
            </UPageGrid>
        </UPageSection>

        <!-- Section témoignages avec layout amélioré -->
        <UPageSection
            id="testimonials"
            :headline="page.testimonials.headline"
            :title="page.testimonials.title"
            :description="page.testimonials.description"
            :ui="{
                container: 'py-12 sm:py-12 lg:py-24'
            }"
        >
            <template #headline>
                <div class="flex justify-center">
                    <UIcon
                        name="i-lucide-heart"
                        class="w-6 h-6 text-primary-500"
                    />
                </div>
            </template>
            <UCarousel
                v-slot="{ item: testimonial }"
                loop
                dots
                :autoplay="{ delay: 10000 }"
                :items="page.testimonials.items"
                :ui="{
                    item: 'basis-1/3 items-stretch h-full',
                    root: 'gap-6 lg:gap-8 max-w-7xl mx-auto',
                    container: 'h-full items-stretch'
                }"
            >
                <UPageCard
                    variant="subtle"
                    :description="testimonial.quote"
                    :ui="{
                        description: 'before:content-[open-quote] after:content-[close-quote] text-gray-600 dark:text-gray-300 italic',
                        body: 'p-2',
                        footer: 'w-full'
                    }"
                    class="break-inside-avoid mb-6 hover:shadow-lg transition-all duration-300 border-l-4 border-primary-500/20 hover:border-primary-500"
                >
                    <template #footer>
                        <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <UUser
                                v-bind="testimonial.user"
                                size="lg"
                                :ui="{
                                    name: 'font-semibold text-gray-900 dark:text-white',
                                    description: 'text-primary-600 dark:text-primary-400 text-sm'
                                }"
                            />
                        </div>
                    </template>
                </UPageCard>
            </UCarousel>
        </UPageSection>

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
                    <h2 class="text-4xl lg:text-5xl font-bold mb-6">
                        {{ page.cta.title }}
                    </h2>
                    <p class="text-xl text-primary-400 mb-8 max-w-2xl mx-auto">
                        {{ page.cta.description }}
                    </p>
                    <div class="flex flex-col sm:flex-row gap-4 justify-center">
                        <UButton
                            v-for="(link, index) in page.cta.links"
                            :key="index"
                            v-bind="link"
                            :variant="index === 0 ? 'link' : 'outline'"
                            size="xl"
                        />
                    </div>
                </div>
            </template>
        </UPageCTA>
    </div>
</template>

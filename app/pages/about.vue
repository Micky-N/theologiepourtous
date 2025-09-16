<script setup lang="ts">
const { data: page } = await useAsyncData('about', () => queryCollection('about').first())

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description

useSeoMeta({
    title,
    ogTitle: title,
    description,
    ogDescription: description
})

defineOgImageComponent('Saas')
</script>

<template>
    <div v-if="page">
        <!-- Hero Section avec photo de profil -->
        <UPageHero
            :title="page.title"
            :description="page.description"
            :links="page?.hero?.links"
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

            <!-- Photo de profil et présentation -->
            <div class="relative mx-auto w-full max-w-4xl">
                <div class="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary-50 to-white dark:from-primary-900/20 dark:to-gray-900/50 p-8">
                    <div class="flex flex-col lg:flex-row items-center gap-8">
                        <!-- Photo de profil -->
                        <div class="relative flex-shrink-0">
                            <div class="w-40 h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden border-4 border-primary-200 dark:border-primary-800 shadow-lg">
                                <NuxtImg
                                    src="/images/profile-mickael.jpg"
                                    alt="Ancien Mickaël NDINGA"
                                    class="w-full h-full object-cover"
                                />
                            </div>
                            <!-- Badge Ancien -->
                            <UBadge
                                label="Ancien"
                                color="primary"
                                variant="solid"
                                class="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
                            />
                        </div>

                        <!-- Informations principales -->
                        <div class="text-center lg:text-left flex-1">
                            <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                                Ancien Mickaël NDINGA
                            </h2>
                            <p class="text-lg text-primary-600 dark:text-primary-400 mb-4">
                                Chrétien Évangélique Pentecôtiste
                            </p>
                            <p class="text-gray-600 dark:text-gray-300 mb-4">
                                Marié, père de 2 enfants<br>
                                Membre de l'église Mystère de l'Époux - Lyon Vénissieux
                            </p>

                            <!-- Tags des compétences -->
                            <div class="flex flex-wrap justify-center lg:justify-start gap-2">
                                <UBadge
                                    label="Enseignant"
                                    variant="soft"
                                />
                                <UBadge
                                    label="Musicien"
                                    variant="soft"
                                />
                                <UBadge
                                    label="Développeur Web"
                                    variant="soft"
                                />
                                <UBadge
                                    label="Théologien"
                                    variant="soft"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Éléments décoratifs -->
                <div class="absolute -top-12 -right-6 w-24 h-24 bg-primary-500/20 rounded-full blur-xl" />
                <div class="absolute -bottom-6 -left-6 w-32 h-32 bg-primary-600/20 rounded-full blur-xl" />
            </div>
        </UPageHero>

        <!-- Statistiques rapides -->
        <UPageSection
            :ui="{
                container: 'py-12 sm:py-12 lg:py-16'
            }"
        >
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div
                    v-for="stat in page.stats"
                    :key="stat.label"
                    class="text-center p-6 rounded-xl bg-white dark:bg-gray-900/50 shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                    <div class="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                        {{ stat.value }}
                    </div>
                    <div class="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                        {{ stat.label }}
                    </div>
                    <div class="text-xs text-gray-600 dark:text-gray-400">
                        {{ stat.description }}
                    </div>
                </div>
            </div>
        </UPageSection>

        <!-- Sections principales -->
        <UPageSection
            v-for="(section, index) in page.sections"
            :key="index"
            :title="section.title"
            :description="section.description"
            :orientation="section.orientation"
            :reverse="section.reverse"
            :ui="{
                container: 'py-12 sm:py-12 lg:py-20'
            }"
        >
            <template #headline>
                <UIcon
                    :name="index === 0 ? 'i-lucide-heart' : index === 1 ? 'i-lucide-graduation-cap' : 'i-lucide-book-open-text'"
                    class="w-6 h-6 text-primary-500"
                />
            </template>

            <!-- Image illustrative pour chaque section -->
            <div class="relative w-full mt-12">
                <div class="relative rounded-xl overflow-hidden shadow-lg">
                    <NuxtImg
                        v-if="index === 0"
                        src="/images/faith-journey.jpg"
                        alt="Parcours de foi chrétienne"
                        class="w-full aspect-video object-cover"
                    />
                    <NuxtImg
                        v-else-if="index === 1"
                        src="/images/theological-formation.jpg"
                        alt="Formation théologique et responsabilités"
                        class="w-full aspect-video object-cover"
                    />
                    <NuxtImg
                        v-else
                        src="/images/biblical-teaching.jpg"
                        alt="Enseignement biblique et étude"
                        class="w-full aspect-video object-cover"
                    />

                    <!-- Overlay avec gradient -->
                    <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>

                <!-- Éléments décoratifs -->
                <div class="absolute -top-6 -right-6 w-20 h-20 bg-primary-500/20 rounded-full blur-lg" />
                <div class="absolute -bottom-6 -left-6 w-24 h-24 bg-primary-600/20 rounded-full blur-lg" />
            </div>
        </UPageSection>

        <!-- Section Formation École Pneuma avec lien -->
        <UPageSection
            title="Formation Théologique"
            description="Approfondir les connaissances bibliques pour un ministère équilibré et fidèle aux Écritures."
            :ui="{
                container: 'py-12 sm:py-12 lg:py-20'
            }"
        >
            <template #headline>
                <div class="flex justify-center">
                    <UIcon
                        name="i-lucide-school"
                        class="w-6 h-6 text-primary-500"
                    />
                </div>
            </template>

            <div class="relative p-8 rounded-2xl bg-gradient-to-br from-primary-50 to-white dark:from-primary-900/20 dark:to-gray-900/50 border border-primary-200/50 dark:border-primary-800/50">
                <div class="flex flex-col lg:flex-row items-center gap-8">
                    <div class="flex-shrink-0">
                        <NuxtImg
                            src="/images/ecolepneuma.png"
                            alt="École Pneuma - Formation théologique"
                            class="w-32 h-32 rounded-xl object-cover shadow-lg"
                        />
                    </div>

                    <div class="flex-1 text-center lg:text-left">
                        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            École Pneuma
                        </h3>
                        <p class="text-gray-600 dark:text-gray-300 mb-4">
                            Formation théologique approfondie sous la direction du révérend pasteur
                            <strong>Nicolas MAYUBA</strong>. Une école dédiée à l'excellence dans
                            l'étude des Écritures et la formation de serviteurs de Dieu qualifiés.
                        </p>

                        <UButton
                            to="https://ecolepneuma.com/"
                            external
                            target="_blank"
                            icon="i-lucide-external-link"
                            trailing
                            size="lg"
                            label="Découvrir l'École Pneuma"
                        />
                    </div>
                </div>
            </div>

            <div class="relative p-8 rounded-2xl bg-gradient-to-br from-primary-50 to-white dark:from-primary-900/20 dark:to-gray-900/50 border border-primary-200/50 dark:border-primary-800/50">
                <div class="flex flex-col lg:flex-row items-center gap-8">
                    <div class="flex-shrink-0">
                        <NuxtImg
                            src="/images/mume.jpg"
                            alt="Église Mystère de l'Époux - Lyon Vénissieux"
                            class="w-32 h-32 rounded-xl object-cover shadow-lg"
                        />
                    </div>

                    <div class="flex-1 text-center lg:text-left">
                        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            Église Mystère de l'Époux
                        </h3>
                        <p class="text-gray-600 dark:text-gray-300 mb-4">
                            Communauté chrétienne évangélique située à Lyon Vénissieux. Sous la direction de l'Apôtre <strong>Manuel NDINGA</strong>, l'église est centrée sur la relation vivante entre Christ (l'Époux) et l'Église (Son Épouse). Les valeurs: l’amour, la puissance, la foi et la maturité.
                        </p>

                        <UButton
                            to="https://www.facebook.com/eglisemume/"
                            external
                            target="_blank"
                            icon="i-lucide-external-link"
                            trailing
                            size="lg"
                            label="Découvrir l'Église"
                        />
                    </div>
                </div>
            </div>
        </UPageSection>

        <!-- Section Témoignages / Citations -->
        <UPageSection
            title="Philosophie de Ministère"
            :ui="{
                container: 'py-12 sm:py-12 lg:py-20'
            }"
        >
            <template #headline>
                <div class="flex justify-center">
                    <UIcon
                        name="i-lucide-quote"
                        class="w-6 h-6 text-primary-500"
                    />
                </div>
            </template>

            <div
                class="relative p-8 rounded-2xl bg-white dark:bg-gray-900/50 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-primary-500"
            >
                <UIcon
                    name="i-lucide-quote"
                    class="absolute top-4 right-4 w-8 h-8 text-primary-200 dark:text-primary-800"
                />

                <blockquote class="text-lg text-gray-700 dark:text-gray-300 mb-6 italic">
                    {{ page.quotation.quote }}
                </blockquote>

                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
                        <UIcon
                            name="i-lucide-user"
                            class="w-6 h-6 text-primary-600 dark:text-primary-400"
                        />
                    </div>
                    <div>
                        <div class="font-semibold text-gray-900 dark:text-white">
                            {{ page.quotation.author }}
                        </div>
                        <div class="text-sm text-primary-600 dark:text-primary-400">
                            {{ page.quotation.role }}
                        </div>
                    </div>
                </div>
            </div>
        </UPageSection>

        <!-- Call to Action -->
        <UPageSection
            :ui="{
                container: 'py-12 sm:py-12 lg:py-20'
            }"
        >
            <div class="text-center max-w-3xl mx-auto">
                <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Explorons Ensemble les Richesses de la Parole
                </h2>
                <p class="text-lg text-gray-600 dark:text-gray-300 mb-8">
                    Rejoignez-moi dans cette aventure d'apprentissage et de croissance spirituelle.
                    Découvrez les enseignements et partagez votre propre parcours de foi.
                </p>

                <div class="flex flex-col sm:flex-row justify-center gap-4">
                    <UButton
                        to="/enseignements"
                        size="xl"
                        icon="i-lucide-book-open"
                        trailing
                        label="Voir les Enseignements"
                    />
                    <UButton
                        to="/blog"
                        size="xl"
                        color="neutral"
                        variant="subtle"
                        icon="i-lucide-newspaper"
                        trailing
                        label="Lire les Articles"
                    />
                </div>
            </div>
        </UPageSection>
    </div>
</template>

<script setup lang="ts">
const columns = [{
    label: 'Ressources',
    children: [{
        label: 'Centre d\'aide',
        to: '/about'
    }, {
        label: 'Documentation',
        to: '/about'
    }, {
        label: 'Études bibliques',
        to: '/bible'
    }, {
        label: 'Articles récents',
        to: '/blog'
    }]
}, {
    label: 'Théologie',
    children: [{
        label: 'Christologie',
        to: '/enseignements/christologie'
    }, {
        label: 'Pneumatologie',
        to: '/enseignements/pneumatologie'
    }, {
        label: 'Sotériologie',
        to: '/enseignements/soteriologie'
    }, {
        label: 'Hamartiologie',
        to: '/enseignements/hamartiologie'
    }]
}, {
    label: 'Communauté',
    children: [{
        label: 'À propos',
        to: '/about'
    }, {
        label: 'Contact',
        to: '/about'
    }, {
        label: 'Rejoindre',
        to: '/signup'
    }, {
        label: 'Blog',
        to: '/blog'
    }]
}]

const toast = useToast()

const email = ref('')
const loading = ref(false)

function onSubmit() {
    loading.value = true

    toast.add({
        title: 'Abonné !',
        description: 'Vous êtes maintenant abonné à notre newsletter.',
        color: 'primary'
    })
}
</script>

<template>
    <USeparator
        icon="i-simple-icons-nuxtdotjs"
        class="h-px"
    />

    <UFooter :ui="{ top: 'border-b border-default' }">
        <template #top>
            <UContainer>
                <UFooterColumns :columns="columns">
                    <template #right>
                        <form @submit.prevent="onSubmit">
                            <UFormField
                                name="email"
                                label="Abonnez-vous à notre newsletter"
                                size="lg"
                            >
                                <UInput
                                    v-model="email"
                                    type="email"
                                    class="w-full"
                                    placeholder="Entrez votre email"
                                >
                                    <template #trailing>
                                        <UButton
                                            type="submit"
                                            size="xs"
                                            color="neutral"
                                            label="S'abonner"
                                        />
                                    </template>
                                </UInput>
                            </UFormField>
                        </form>
                    </template>
                </UFooterColumns>
            </UContainer>
        </template>

        <template #left>
            <p class="text-muted text-sm">
                © {{ new Date().getFullYear() }} Mickaël NDINGA
            </p>
        </template>

        <template #right>
            <UButton
                to="https://github.com/Micky-N"
                target="_blank"
                icon="i-simple-icons-github"
                aria-label="GitHub de l'auteur"
                color="neutral"
                variant="ghost"
            />
            <UButton
                to="mailto:contact@theologiepourtous.fr"
                icon="i-lucide-mail"
                aria-label="Contact par email"
                color="neutral"
                variant="ghost"
            />
        </template>
    </UFooter>
</template>

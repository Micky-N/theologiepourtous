<script setup lang="ts">
import * as z from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import { useNewsletterSubscription } from '~/composables/useNewsletterSubscription';

const { fetchThemes } = useTeachingsApi();
const { subscribe } = useNewsletterSubscription();
const { data: themes } = await useAsyncData('teaching-themes-navigation', () => fetchThemes());
const newsletterSchema = z.object({
    email: z.string()
        .trim()
        .min(1, 'Veuillez saisir votre adresse e-mail')
        .email('Adresse e-mail invalide')
});
type NewsletterSchema = z.output<typeof newsletterSchema>;
const columns = [{
    label: 'Ressources',
    children: [{
        label: 'Études bibliques',
        to: '/bible'
    }, {
        label: 'Articles récents',
        to: '/blog'
    }]
}, {
    label: 'Théologie',
    children: themes.value
        ? themes.value.map(theme => ({
            label: theme.title,
            to: theme.path
        }))
        : []
}, {
    label: 'Communauté',
    children: [{
        label: 'À propos',
        to: '/about'
    }, {
        label: 'Rejoindre',
        to: '/signup'
    }, {
        label: 'Blog',
        to: '/blog'
    }]
}];

const toast = useToast();

const newsletter = reactive<Partial<NewsletterSchema>>({
    email: ''
});
const loading = ref(false);
const submitError = ref<string | false>(false);

async function onSubmit(event: FormSubmitEvent<NewsletterSchema>) {
    submitError.value = false;
    loading.value = true;

    try {
        const { message } = await subscribe(event.data.email);

        toast.add({
            title: 'Newsletter',
            description: message,
            color: 'success'
        });

        newsletter.email = '';
    } catch (error: any) {
        submitError.value = error?.data?.errors?.email?.[0]
          || error?.data?.message
          || 'Impossible de finaliser votre inscription pour le moment.';

        toast.add({
            title: 'Erreur',
            description: submitError.value || 'Une erreur est survenue.',
            color: 'error'
        });
    } finally {
        loading.value = false;
    }
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
                        <UForm
                            :schema="newsletterSchema"
                            :state="newsletter"
                            class="w-full"
                            @submit="onSubmit"
                        >
                            <UFormField
                                name="email"
                                label="Abonnez-vous à notre newsletter"
                                size="lg"
                                :error="submitError"
                            >
                                <UInput
                                    v-model="newsletter.email"
                                    type="email"
                                    class="w-full"
                                    placeholder="Entrez votre email"
                                    :disabled="loading"
                                >
                                    <template #trailing>
                                        <UButton
                                            type="submit"
                                            size="xs"
                                            color="neutral"
                                            label="S'abonner"
                                            :loading="loading"
                                            :disabled="loading"
                                        />
                                    </template>
                                </UInput>
                            </UFormField>
                        </UForm>
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
                to="mailto:contact@theologievivante.fr"
                icon="i-lucide-mail"
                aria-label="Contact par email"
                color="neutral"
                variant="ghost"
            />
        </template>
    </UFooter>
</template>

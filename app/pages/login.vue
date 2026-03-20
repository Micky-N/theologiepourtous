<script setup lang="ts">
import * as z from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';

const route = useRoute();
definePageMeta({
    layout: 'auth'
});

useSeoMeta({
    title: 'Connexion - Théologie pour Tous',
    description: 'Connectez-vous à votre compte pour continuer votre parcours spirituel'
});

const { isAuthenticated, login } = useSanctumAuth();
const toast = useToast();

// Rediriger si déjà connecté
watch(isAuthenticated, (value) => {
    if (value) {
        navigateTo('/');
    }
}, { immediate: true });

const fields = [{
    name: 'email',
    type: 'text' as const,
    label: 'Email',
    placeholder: 'Entrez votre email',
    required: true
}, {
    name: 'password',
    label: 'Mot de passe',
    type: 'password' as const,
    placeholder: 'Entrez votre mot de passe'
}];

const providers = [{
    label: 'Google',
    icon: 'i-simple-icons-google',
    onClick: () => {
        toast.add({
            title: 'Prochainement',
            description: 'Connexion avec Google bientôt disponible',
            color: 'primary'
        });
    }
}];

const schema = z.object({
    email: z.string().email('Format email invalide'),
    password: z.string().min(1, 'Le mot de passe est requis')
});

type Schema = z.output<typeof schema>;

const isLoading = ref(false);

async function onSubmit(payload: FormSubmitEvent<Schema>) {
    isLoading.value = true;

    await login(payload.data).then(async () => {
        const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/';
        await navigateTo(redirect);
    }).catch((reason) => {
        console.error('Erreur de connexion:', reason);

        toast.add({
            title: 'Erreur de connexion',
            description: 'Email ou mot de passe incorrect',
            color: 'error'
        });
    }).finally(() => {
        isLoading.value = false;
    });
}
</script>

<template>
    <UAuthForm
        :fields="fields"
        :schema="schema"
        :providers="providers"
        :loading="isLoading"
        title="Bon retour parmi nous"
        icon="i-lucide-cross"
        @submit="onSubmit"
    >
        <template #description>
            Vous n'avez pas de compte ? <ULink
                to="/signup"
                class="text-primary font-medium"
            >S'inscrire</ULink>.
        </template>

        <template #password-hint>
            <ULink
                to="/"
                class="text-primary font-medium"
                tabindex="-1"
            >Mot de passe oublié ?</ULink>
        </template>

        <template #footer>
            En vous connectant, vous acceptez nos <ULink
                to="/"
                class="text-primary font-medium"
            >Conditions d'utilisation</ULink>.
        </template>
    </UAuthForm>
</template>

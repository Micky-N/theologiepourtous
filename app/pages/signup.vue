<script setup lang="ts">
import * as z from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';
import type { User } from '#auth-utils';

definePageMeta({
    layout: 'auth'
});

useSeoMeta({
    title: 'Inscription - Théologie pour Tous',
    description: 'Créez un compte pour commencer votre parcours théologique'
});

const toast = useToast();
const { loggedIn } = useUserSession();
const { fetch: fetchSession } = useUserSession();

// Rediriger si déjà connecté
watch(loggedIn, (value) => {
    if (value) {
        navigateTo('/');
    }
}, { immediate: true });

const fields = [{
    name: 'name',
    type: 'text' as const,
    label: 'Nom',
    placeholder: 'Entrez votre nom complet',
    required: true
}, {
    name: 'email',
    type: 'text' as const,
    label: 'Email',
    placeholder: 'Entrez votre email',
    required: true
}, {
    name: 'password',
    label: 'Mot de passe',
    type: 'password' as const,
    placeholder: 'Entrez votre mot de passe (min. 6 caractères)',
    required: true
}, {
    name: 'confirmPassword',
    label: 'Confirmer le mot de passe',
    type: 'password' as const,
    placeholder: 'Confirmez votre mot de passe',
    required: true
}];

const providers = [{
    label: 'Google',
    icon: 'i-simple-icons-google',
    onClick: () => {
        toast.add({
            title: 'Prochainement',
            description: 'Inscription avec Google bientôt disponible',
            color: 'primary'
        });
    }
}];

const registerSchema = z.object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(50, 'Le nom ne doit pas dépasser 50 caractères'),
    email: z.string().email('Format d\'email invalide'),
    password: z.string()
        .min(7, 'Le mot de passe doit contenir au moins 7 caractères')
        .regex(/(?=.*[a-z])/, 'Le mot de passe doit contenir au moins une minuscule')
        .regex(/(?=.*[A-Z])/, 'Le mot de passe doit contenir au moins une majuscule')
        .regex(/(?=.*\d)/, 'Le mot de passe doit contenir au moins un chiffre'),
    confirmPassword: z.string().min(7)
}).refine(data => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword']
});

type Schema = z.output<typeof registerSchema>;

const isLoading = ref(false);

async function onSubmit(payload: FormSubmitEvent<Schema>) {
    isLoading.value = true;

    try {
        const response = await $fetch<{
            success: boolean
            message: string
            user: User
        }>('/api/auth/register', {
            method: 'POST',
            body: payload.data
        });

        if (response.success) {
            await fetchSession();
            await navigateTo('/');
        }

        toast.add({
            title: 'Inscription réussie',
            description: `Bienvenue ${response.user.name} ! Votre compte a été créé avec succès.`,
            color: 'success'
        });
    } catch (error: any) {
        console.error('Erreur d\'inscription:', error);

        let errorMessage = 'Une erreur s\'est produite lors de l\'inscription';

        if (error.statusCode === 409) {
            errorMessage = 'Un utilisateur avec cet email existe déjà';
        } else if (error.data?.message) {
            errorMessage = error.data.message;
        }

        toast.add({
            title: 'Erreur d\'inscription',
            description: errorMessage,
            color: 'error'
        });
    } finally {
        isLoading.value = false;
    }
}
</script>

<template>
    <UAuthForm
        :fields="fields"
        :schema="registerSchema"
        :providers="providers"
        :loading="isLoading"
        title="Créer un compte"
        icon="i-lucide-user-plus"
        :submit="{ label: 'Créer le compte' }"
        @submit="onSubmit"
    >
        <template #description>
            Vous avez déjà un compte ? <ULink
                to="/login"
                class="text-primary font-medium"
            >Se connecter</ULink>.
        </template>

        <template #footer>
            En vous inscrivant, vous acceptez nos <ULink
                to="/"
                class="text-primary font-medium"
            >Conditions d'utilisation</ULink>.
        </template>
    </UAuthForm>
</template>

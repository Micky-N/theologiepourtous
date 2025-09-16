<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
    layout: 'auth'
})

useSeoMeta({
    title: 'Inscription - Théologie pour Tous',
    description: 'Créez un compte pour commencer votre parcours théologique'
})

const toast = useToast()

const fields = [{
    name: 'name',
    type: 'text' as const,
    label: 'Nom',
    placeholder: 'Entrez votre nom'
}, {
    name: 'email',
    type: 'text' as const,
    label: 'Email',
    placeholder: 'Entrez votre email'
}, {
    name: 'password',
    label: 'Mot de passe',
    type: 'password' as const,
    placeholder: 'Entrez votre mot de passe'
}]

const providers = [{
    label: 'Google',
    icon: 'i-simple-icons-google',
    onClick: () => {
        toast.add({
            title: 'Google',
            description: 'Inscription avec Google',
            color: 'primary'
        })
    }
}]

const schema = z.object({
    name: z.string().min(1, 'Le nom est requis'),
    email: z.string().email('Email invalide'),
    password: z.string().min(8, 'Doit contenir au moins 8 caractères')
})

type Schema = z.output<typeof schema>

function onSubmit(payload: FormSubmitEvent<Schema>) {
    console.log('Submitted', payload)
}
</script>

<template>
    <UAuthForm
        :fields="fields"
        :schema="schema"
        :providers="providers"
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

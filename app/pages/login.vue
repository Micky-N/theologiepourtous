<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
    layout: 'auth'
})

useSeoMeta({
    title: 'Connexion - Théologie pour Tous',
    description: 'Connectez-vous à votre compte pour continuer votre parcours spirituel'
})

const toast = useToast()

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
}, {
    name: 'remember',
    label: 'Se souvenir de moi',
    type: 'checkbox' as const
}]

const providers = [{
    label: 'Google',
    icon: 'i-simple-icons-google',
    onClick: () => {
        toast.add({
            title: 'Google',
            description: 'Connexion avec Google',
            color: 'primary'
        })
    }
}]

const schema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Must be at least 8 characters')
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

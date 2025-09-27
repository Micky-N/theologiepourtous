<script setup lang="ts">
import * as z from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';

type ProfileSchema = z.output<typeof profileSchema>;

const { user, fetch: fetchSession } = useUserSession();
const toast = useToast();

const profileSchema = z.object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z.string().email('Adresse mail invalide'),
    currentPassword: z.string().min(7).nullable(),
    newPassword: z.string().min(7, 'Le mot de passe doit contenir au moins 7 caractères')
        .regex(/(?=.*[a-z])/, 'Le mot de passe doit contenir au moins une minuscule')
        .regex(/(?=.*[A-Z])/, 'Le mot de passe doit contenir au moins une majuscule')
        .regex(/(?=.*\d)/, 'Le mot de passe doit contenir au moins un chiffre')
        .nullable(),
    confirmPassword: z.string().min(7).nullable()
}).refine(data => !data.newPassword || data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirm_password']
});

const profile = reactive<Partial<ProfileSchema>>({
    name: user.value?.name,
    email: user.value?.email,
    currentPassword: null,
    newPassword: null,
    confirmPassword: null
});
const onSubmit = async (event: FormSubmitEvent<ProfileSchema>) => {
    const { message } = await $fetch('/api/profile', { method: 'PUT', body: event.data });
    toast.add({
        title: 'Succès',
        description: message,
        icon: 'i-lucide-check',
        color: 'success'
    });
    await fetchSession();
};
</script>

<template>
    <UForm
        id="general-settings"
        :schema="profileSchema"
        :state="profile"
        @submit="onSubmit"
    >
        <UPageCard variant="subtle">
            <UFormField
                name="name"
                label="Nom"
                description="Ce nom sera affiché publiquement sur votre profil"
                required
                class="flex max-sm:flex-col justify-between items-start gap-4"
            >
                <UInput
                    v-model="profile.name"
                    autocomplete="off"
                />
            </UFormField>
            <USeparator />
            <UFormField
                name="email"
                label="Adresse e-mail"
                description="Utilisée pour se connecter et recevoir des newsletters"
                required
                class="flex max-sm:flex-col justify-between items-start gap-4"
            >
                <UInput
                    v-model="profile.email"
                    type="email"
                    autocomplete="off"
                />
            </UFormField>
            <USeparator />
            <UFormField
                name="current_password"
                label="Mot de passe actuel"
                description="Entrez votre mot de passe actuel."
                required
                class="flex max-sm:flex-col justify-between items-start gap-4"
            >
                <UInput
                    v-model="profile.currentPassword"
                    type="password"
                    placeholder="********"
                    class="w-full"
                />
            </UFormField>
            <USeparator />
            <UFormField
                name="new_password"
                label="Nouveau mot de passe"
                description="Entrez votre nouveau mot de passe."
                required
                class="flex max-sm:flex-col justify-between items-start gap-4"
            >
                <UInput
                    v-model="profile.newPassword"
                    type="password"
                    placeholder="********"
                    class="w-full"
                />
            </UFormField>
            <USeparator />
            <UFormField
                name="confirm_password"
                label="Confirmez le mot de passe"
                description="Confirmez votre nouveau mot de passe."
                required
                class="flex max-sm:flex-col justify-between items-start gap-4"
            >
                <UInput
                    v-model="profile.confirmPassword"
                    type="password"
                    placeholder="********"
                    class="w-full"
                />
            </UFormField>
        </UPageCard>
        <UButton
            label="Enregistrer les modifications"
            color="neutral"
            type="submit"
            class="w-fit lg:ms-auto mt-4"
        />
    </UForm>
</template>

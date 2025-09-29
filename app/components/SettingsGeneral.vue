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

// Modal de confirmation pour la suppression
const deleteModal = ref(false);
const deletePassword = ref('');
const isDeleting = ref(false);

// Fonction pour supprimer le compte
const deleteAccount = async () => {
    if (!deletePassword.value) {
        toast.add({
            title: 'Erreur',
            description: 'Veuillez entrer votre mot de passe',
            color: 'error'
        });
        return;
    }

    try {
        isDeleting.value = true;

        await $fetch('/api/profile/delete-account', {
            method: 'POST',
            body: { password: deletePassword.value }
        });

        toast.add({
            title: 'Compte supprimé',
            description: 'Votre compte a été supprimé avec succès',
            color: 'success'
        });

        await fetchSession();

        // Rediriger vers la page d'accueil après suppression
        await navigateTo('/');
    } catch (error: any) {
        toast.add({
            title: 'Erreur',
            description: error.data?.message || 'Erreur lors de la suppression du compte',
            color: 'error'
        });
    } finally {
        isDeleting.value = false;
        deleteModal.value = false;
        deletePassword.value = '';
    }
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
    <UPageCard
        title="Suppression du compte"
        description="Vous ne souhaitez plus utiliser notre service ? Vous pouvez supprimer votre compte ici. Cette action est irréversible. Toutes les informations liées à ce compte seront supprimées définitivement."
        class="bg-gradient-to-tl from-error/10 from-5% to-default"
    >
        <template #footer>
            <UButton
                label="Supprimer le compte"
                color="error"
                @click="deleteModal = true"
            />
        </template>
    </UPageCard>

    <!-- Modal de confirmation pour la suppression -->
    <UModal v-model:open="deleteModal">
        <template #content>
            <UCard>
                <template #header>
                    <h3 class="text-lg font-semibold text-error-600 dark:text-error-400">
                        Supprimer définitivement votre compte
                    </h3>
                </template>

                <div class="space-y-4">
                    <UAlert
                        color="error"
                        variant="soft"
                        title="Attention !"
                        description="Cette action est irréversible. Toutes vos données (signets, notes, progrès) seront supprimées définitivement."
                    />

                    <UFormField
                        label="Mot de passe"
                        description="Entrez votre mot de passe pour confirmer la suppression"
                        required
                    >
                        <UInput
                            v-model="deletePassword"
                            type="password"
                            placeholder="Entrez votre mot de passe"
                            :disabled="isDeleting"
                        />
                    </UFormField>
                </div>

                <template #footer>
                    <div class="flex gap-3 justify-end">
                        <UButton
                            label="Annuler"
                            color="neutral"
                            variant="soft"
                            :disabled="isDeleting"
                            @click="deleteModal = false"
                        />
                        <UButton
                            label="Supprimer définitivement"
                            color="error"
                            :loading="isDeleting"
                            :disabled="!deletePassword"
                            @click="deleteAccount"
                        />
                    </div>
                </template>
            </UCard>
        </template>
    </UModal>
</template>

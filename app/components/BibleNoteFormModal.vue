<template>
    <UForm
        :state="form"
    >
        <UModal
            v-model:open="open"
            :overlay="true"
            :ui="{ content: 'max-w-lg' }"
        >
            <template #header>
                <div class="flex items-center gap-2">
                    <UIcon
                        name="i-lucide-pencil"
                        class="text-primary-600"
                    />
                    <span class="font-semibold text-lg">{{ isEdit ? 'Modifier la note' : 'Ajouter une note' }}</span>
                </div>
            </template>
            <template #body>
                <UFormField
                    label="Titre (optionnel)"
                    name="title"
                >
                    <UInput
                        v-model="form.title"
                        placeholder="Titre de la note..."
                        class="w-full"
                    />
                </UFormField>
                <UFormField
                    label="Contenu"
                    name="content"
                    class="mt-4"
                    required
                >
                    <UTextarea
                        v-model="form.content"
                        placeholder="Votre note..."
                        class="w-full"
                        :rows="5"
                    />
                </UFormField>
                <UFormField
                    label="Note privée"
                    name="isPrivate"
                    class="mt-4"
                >
                    <USwitch
                        v-model="form.isPrivate"
                        label="Visible uniquement par moi"
                    />
                </UFormField>
                <div
                    v-if="error"
                    class="text-red-500 text-sm mt-2"
                >
                    {{ error }}
                </div>
            </template>
            <template #footer>
                <div class="w-full flex justify-end gap-2">
                    <UButton
                        color="secondary"
                        variant="ghost"
                        @click="closeModal"
                    >
                        Annuler
                    </UButton>
                    <UButton
                        type="submit"
                        color="primary"
                        :loading="loading"
                        @click="handleSubmit"
                    >
                        {{ isEdit ? 'Enregistrer' : 'Ajouter' }}
                    </UButton>
                </div>
            </template>
        </UModal>
    </UForm>
</template>

<script lang="ts" setup>
import type { BibleNote } from '@prisma/client';
import { ref, reactive, watch } from 'vue';

const props = defineProps<{
    verseId?: number
    note?: {
        id: number
        title: string | null
        content: string
        isPrivate: boolean
    }
}>();

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'created' | 'updated', note: any): void
}>();

const open = defineModel<boolean>({ default: false });
const isEdit = ref(!!props.note);

const form = reactive({
    title: props.note?.title ?? '',
    content: props.note?.content ?? '',
    isPrivate: props.note?.isPrivate ?? true
});

watch(() => props.note, (note) => {
    if (note) {
        form.title = note.title ?? '';
        form.content = note.content ?? '';
        form.isPrivate = note.isPrivate ?? true;
        isEdit.value = true;
    } else {
        form.title = '';
        form.content = '';
        form.isPrivate = true;
        isEdit.value = false;
    }
});

const loading = ref(false);
const error = ref('');
const toast = useToast();

function closeModal() {
    open.value = false;
    emit('close');
}

async function handleSubmit() {
    error.value = '';
    loading.value = true;
    try {
        let response: {
            success: boolean
            message: string
            note: BibleNote
        } | null = null;
        if (isEdit.value && props.note) {
            response = await $fetch<{
                success: boolean
                message: string
                note: BibleNote
            }>(`/api/bible/notes/${props.note.id}`, {
                method: 'PUT',
                body: {
                    title: form.title,
                    content: form.content,
                    isPrivate: form.isPrivate
                }
            });
        } else {
            response = await $fetch<{
                success: boolean
                message: string
                note: BibleNote
            }>('/api/bible/notes', {
                method: 'POST',
                body: {
                    verseId: props.verseId,
                    title: form.title,
                    content: form.content,
                    isPrivate: form.isPrivate
                }
            });
        }
        if (response.success) {
            toast.add({ title: isEdit.value ? 'Note modifiée' : 'Note ajoutée', description: response.message, color: 'primary' });
            if (isEdit.value) emit('updated', response.note);
            else emit('created', response.note);
            closeModal();
        } else {
            error.value = response.message || 'Erreur inconnue';
        }
    } catch (e: any) {
        error.value = e?.statusMessage || 'Erreur lors de l’enregistrement de la note';
    } finally {
        loading.value = false;
    }
}
</script>

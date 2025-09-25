<template>
    <USlideover
        v-model:open="open"
        :dismissible="false"
        title="Ajouter une note"
        :description="reference"
        :ui="{
            footer: 'justify-end',
            body: 'flex flex-col justify-between gap-4'
        }"
    >
        <template #body>
            <UInput
                v-model="form.title"
                placeholder="Titre..."
            />
            <UTextarea
                v-model="form.content"
                placeholder="Contenu..."
                class="flex-1 h-full"
                :ui="{
                    base: 'h-full'
                }"
                autoresize
            />
            <USwitch
                v-model="form.isPrivate"
                label="Visible uniquement par moi"
            />
        </template>
        <template #footer="{ close }">
            <UButton
                label="Annuler"
                color="neutral"
                variant="outline"
                @click="close"
            />
            <UButton
                label="Enregistrer"
                color="neutral"
                @click="handleSubmit"
            />
        </template>
    </USlideover>
</template>

<script lang="ts" setup>
import type { BibleBook, BibleNote, BibleVerse } from '@prisma/client';

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'created' | 'updated', note: any): void
}>();

const { note = null, verse, book } = defineProps<{
    note?: (BibleNote & { reference: string }) | null
    verse: BibleVerse
    book: BibleBook
}>();
const open = defineModel<boolean>('open', { default: false });
const isEdit = ref(false);
const form = reactive({
    title: note?.title ?? '',
    content: note?.content ?? '',
    isPrivate: note?.isPrivate ?? true
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
        if (isEdit.value && note) {
            response = await $fetch<{
                success: boolean
                message: string
                note: BibleNote
            }>(`/api/bible/notes/${note.id}`, {
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
                    verseId: verse.id,
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

const reference = computed(() => {
    return `${book.name} ${verse.chapter}:${verse.verse}`;
});

watch(() => note, (note) => {
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
</script>

<style>

</style>

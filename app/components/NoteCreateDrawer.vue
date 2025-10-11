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
import type { BibleNote, BibleVerse } from '~~/src/database/models';
import type { Testament } from '~~/src/enums/bibleType';

const emit = defineEmits<{
    (e: 'close' | 'refreshNote'): void;
}>();

const { note = null, verse, book } = defineProps<{
    note?: BibleNote | null;
    verse: BibleVerse;
    book: {
        name: string;
        code: string;
        testament: Testament;
    };
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
    form.content = '';
    form.title = '';
}

async function handleSubmit() {
    error.value = '';
    loading.value = true;
    try {
        let response: {
            success: boolean;
            message: string;
            note: BibleNote;
        } | null = null;
        if (isEdit.value && note) {
            response = await $fetch<{
                success: boolean;
                message: string;
                note: BibleNote;
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
                success: boolean;
                message: string;
                note: BibleNote;
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
            emit('refreshNote');
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

watch(open, (value) => {
    if (value) {
        form.title = note?.title ?? '';
        form.content = note?.content ?? '';
        form.isPrivate = note?.isPrivate ?? true;
        isEdit.value = !!note;
    } else {
        form.title = '';
        form.content = '';
        form.isPrivate = true;
        isEdit.value = false;
    }
}, { immediate: true });
</script>

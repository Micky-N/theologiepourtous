<template>
    <USlideover
        v-model:open="open"
        :title="selectedNote?.title || 'Liste des notes'"
        :description="reference"
        :ui="{ footer: 'justify-end' }"
    >
        <template #body>
            <template v-if="selectedNote">
                <p
                    class="whitespace-pre-wrap"
                    v-html="selectedNote.content"
                />
            </template>
            <template v-else>
                <div class="space-y-4">
                    <UCard
                        v-for="note in notes"
                        :key="note.id"
                        variant="outline"
                        :ui="{
                            body: 'p-2 sm:py-2 sm:px-4'
                        }"
                    >
                        <div class="flex justify-between gap-4 items-center">
                            <div class="flex gap-2 items-center">
                                <UButton
                                    icon="i-lucide-eye"
                                    size="md"
                                    color="primary"
                                    variant="link"
                                    @click="selectedNoteId = note.id"
                                />
                                <h4 class="line-clamp-1">
                                    {{ note.title }}
                                </h4>
                            </div>
                            <UPopover arrow>
                                <UButton
                                    icon="i-lucide-trash-2"
                                    size="md"
                                    color="error"
                                    variant="ghost"
                                />

                                <template #content>
                                    <UPageCard
                                        title="Suppression de la note"
                                        description="Êtes-vous sûr de vouloir supprimer cette note ? Cette action est irréversible."
                                        icon="i-lucide-trash-2"
                                        :ui="{
                                            root: 'max-w-sm',
                                            leadingIcon: 'text-red-500'
                                        }"
                                    >
                                        <UButton
                                            label="Supprimer"
                                            color="error"
                                            variant="subtle"
                                            :ui="{
                                                base: 'justify-center'
                                            }"
                                            @click="removeNote(note)"
                                        />
                                    </UPageCard>
                                </template>
                            </UPopover>
                        </div>
                    </UCard>
                </div>
            </template>
        </template>
        <template
            v-if="selectedNote && footer"
            #footer
        >
            <UButton
                v-if="notes.length > 1"
                icon="i-lucide-arrow-left"
                size="md"
                color="primary"
                variant="link"
                @click="selectedNoteId = null"
            />
            <div class="flex flex-1 justify-end gap-2 items-center">
                <UButton
                    label="Modifier"
                    color="secondary"
                    @click="emit('edit:note', selectedNote)"
                />
                <UPopover arrow>
                    <UButton
                        label="Supprimer"
                        color="error"
                        variant="outline"
                    />

                    <template #content>
                        <UPageCard
                            title="Suppression de la note"
                            description="Êtes-vous sûr de vouloir supprimer cette note ? Cette action est irréversible."
                            icon="i-lucide-trash-2"
                            :ui="{
                                root: 'max-w-sm',
                                leadingIcon: 'text-red-500'
                            }"
                        >
                            <UButton
                                label="Supprimer"
                                color="error"
                                variant="subtle"
                                :ui="{
                                    base: 'justify-center'
                                }"
                                @click="removeNote(selectedNote)"
                            />
                        </UPageCard>
                    </template>
                </UPopover>
            </div>
        </template>
    </USlideover>
</template>

<script lang="ts" setup>
import type { BibleNote } from '~~/src/database/models';

const { notes, book, verse, footer = true } = defineProps<{
    notes: BibleNote[];
    verse: { chapter: number; verse: number; };
    book: { name: string; };
    footer?: boolean;
}>();

const emit = defineEmits<{
    (e: 'edit:note', value: BibleNote): void;
    (e: 'refreshNote'): void;
}>();

const toast = useToast();
const open = defineModel<boolean>('open', { default: false });
const selectedNoteId = ref<BibleNote['id'] | null>(null);
const selectedNote = computed(() => notes.find(note => note.id === selectedNoteId.value) || null);

watch(open, (value) => {
    if (value && notes.length) {
        if (notes.length == 1 && notes[0]?.id) {
            selectedNoteId.value = notes[0]?.id;
        } else if (notes.length > 1) {
            selectedNoteId.value = null;
        }
    }
}, { immediate: true });

const reference = computed(() => {
    return `${book.name} ${verse.chapter}:${verse.verse}`;
});

const removeNote = async (note: BibleNote) => {
    try {
        await $fetch(`/api/bible/notes/${note.id}`, {
            method: 'DELETE'
        });
        toast.add({
            title: 'Suppression succès',
            description: 'La note a bien été supprimée'
        });
        emit('refreshNote');
        if (notes.length == 1) {
            open.value = false;
        }
    } catch (e) {
        console.error(e);
        toast.add({
            color: 'error',
            title: 'Erreur',
            description: 'Erreur lors de la suppression'
        });
    }
};
</script>

<style>

</style>

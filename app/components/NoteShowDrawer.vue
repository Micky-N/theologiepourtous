<template>
    <USlideover
        v-model:open="open"
        :title="selectedNote?.title || 'Liste des notes'"
        :description="selectedNote?.reference || 'Choisie une note'"
        :ui="{ footer: 'justify-end' }"
    >
        <template #body>
            <template v-if="selectedNote">
                <p v-html="nl2br(selectedNote.content)" />
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
                                    icon="i-lucide-arrow-left"
                                    size="md"
                                    color="primary"
                                    variant="link"
                                    @click="selectedNoteId = note.id"
                                />
                                <h4 class="line-clamp-1">
                                    {{ note.title }}
                                </h4>
                            </div>
                            <UButton
                                icon="i-lucide-trash-2"
                                size="md"
                                color="error"
                                variant="ghost"
                            />
                        </div>
                    </UCard>
                </div>
            </template>
        </template>
        <template
            v-if="selectedNote"
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
                />
                <UButton
                    label="Supprimer"
                    color="error"
                    variant="outline"
                />
            </div>
        </template>
    </USlideover>
</template>

<script lang="ts" setup>
import type { BibleNote } from '@prisma/client';

const { notes } = defineProps<{
    notes: (BibleNote & { reference: string })[]
}>();
const open = defineModel<boolean>('open', { default: false });
const selectedNoteId = ref<BibleNote['id'] | null>(null);
const selectedNote = computed(() => notes.find(note => note.id === selectedNoteId.value) || null);

watch(open, (value) => {
    if (value) {
        if (notes.length == 1 && notes[0]?.id) {
            selectedNoteId.value = notes[0]?.id;
        }
    } else {
        selectedNoteId.value = null;
    }
});

const nl2br = (str: string) => str.replace('\n', '<br />\n');
</script>

<style>

</style>

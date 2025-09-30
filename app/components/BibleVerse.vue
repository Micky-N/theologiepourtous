<template>
    <UContextMenu
        :items="items"
    >
        <span>
            <button
                v-if="loggedIn && notes.length"
                class="cursor-pointer mr-0.5"
                @click="openedNoteShowDrawer = true"
            >
                <UIcon
                    name="i-lucide-notebook-pen"
                    class="size-3 text-warning-500 dark:text-warning-400"
                />
            </button>
            <sup class="text-xs text-primary-600 dark:text-primary-400">
                {{ verse.verse }}
            </sup>
            <UPopover
                v-model:open="openedBookmarkForm"
                :content="{
                    sideOffset: 0
                }"
                arrow
            >
                <template #anchor>
                    <span
                        :class="{
                            'underline': openedBookmarkForm || bookmark,
                            'bg-yellow-500/20': selectedVerse
                        }"
                    >
                        <template v-if="!bookmark">{{ verse.text }}</template>

                        <UPopover
                            v-else
                            mode="hover"
                            arrow
                            @update:open="value => !value && (deletingBookmark = false)"
                        >
                            <span
                                class="decoration-2"
                                :class="{
                                    underline: openedBookmarkForm || bookmark
                                }"
                                :style="`text-decoration-color: var(--color-${bookmark?.color}-500)`"
                            >
                                {{ verse.text }}
                            </span>
                            <template
                                #content
                            >
                                <UCard
                                    :ui="{
                                        header: 'p-2 sm:px-4',
                                        footer: 'p-2 sm:px-4 flex items-center space-x-4'
                                    }"
                                >
                                    <template #header>
                                        <div class="flex items-center justify-between gap-2">
                                            <p>
                                                {{ bookmark.title || 'Signet' }}
                                            </p>
                                            <span
                                                class="cursor-pointer rounded-sm bg-gray-50 hover:bg-red-50 flex items-center justify-center p-1 text-red-500 hover:text-red-700"
                                                @click="deletingBookmark = true"
                                            >
                                                <UIcon
                                                    name="i-lucide-trash-2"
                                                />
                                            </span>
                                        </div>
                                    </template>
                                    <template
                                        v-if="deletingBookmark"
                                        #footer
                                    >
                                        <UButton
                                            size="sm"
                                            color="error"
                                            @click="deleteBookmark"
                                        >
                                            Supprimer
                                        </UButton>
                                        <UButton
                                            size="sm"
                                            variant="outline"
                                            color="neutral"
                                        >
                                            Annuler
                                        </UButton>
                                    </template>
                                </UCard>
                            </template>
                        </UPopover>
                    </span>
                </template>
                <template #content>
                    <BookmarkFormPopover
                        :verse-id="verse.id"
                        @close-form="openedBookmarkForm = false"
                        @created="emit('refreshBookmark')"
                    />
                </template>
            </UPopover>
        </span>
    </UContextMenu>
    <NoteShowDrawer
        v-model:open="openedNoteShowDrawer"
        :notes="notes"
        :verse="verse"
        :book="book"
        @edit:note="editNote"
        @refresh-note="emit('refreshNote')"
    />
    <NoteCreateDrawer
        v-model:open="openedNoteCreateDrawer"
        :verse="verse"
        :book="book"
        :note="noteToEdit"
        @refresh-note="emit('refreshNote')"
    />
</template>

<script lang="ts" setup>
import type { ContextMenuItem } from '@nuxt/ui';
import type { BibleBook, BibleBookmark, BibleNote, BibleVerse } from '@prisma/client';

const props = defineProps<{
    book: BibleBook;
    verse: BibleVerse;
    notes: BibleNote[];
    bookmark: BibleBookmark | null;
}>();

const emit = defineEmits<{
    (e: 'showCompare' | 'addNote', verseId: number): void;
    (e: 'refreshBookmark' | 'refreshNote'): void;
}>();

const route = useRoute();
const deletingBookmark = ref(false);
const openedBookmarkForm = ref(false);
const toast = useToast();
const openedNoteShowDrawer = ref(false);
const openedNoteCreateDrawer = ref(false);
const verseQuery = route.query.verse as string | undefined;
const { loggedIn } = useUserSession();

const items = computed<ContextMenuItem[]>(() => {
    const baseItems = [{
        label: 'Comparer',
        icon: 'i-lucide-eye',
        onSelect: () => emit('showCompare', props.verse.verse),
        ui: {
            item: 'cursor-pointer'
        }
    }];
    if (loggedIn.value) {
        baseItems.push({
            label: 'Marquer',
            icon: 'i-lucide-bookmark',
            onSelect: () => openedBookmarkForm.value = true,
            ui: {
                item: 'cursor-pointer'
            }
        });
        baseItems.push({
            label: 'Ajouter Note',
            icon: 'i-lucide-notebook-pen',
            onSelect: () => openedNoteCreateDrawer.value = true,
            ui: {
                item: 'cursor-pointer'
            }
        });
    }
    return baseItems;
});

const deleteBookmark = async () => {
    if (!props.bookmark) return;
    try {
        await $fetch(`/api/bible/bookmarks/${props.bookmark.id}`, {
            method: 'DELETE'
        });
        toast.add({
            title: 'Signet supprimé',
            description: 'Le signet a été supprimer avec succès'
        });
        emit('refreshBookmark');
    } catch (e) {
        console.error(e);
    }
};

const noteToEdit = ref<BibleNote | null>(null);

const editNote = (note: BibleNote) => {
    noteToEdit.value = note;
    openedNoteCreateDrawer.value = true;
};

const selectedVerse = computed(() => {
    if (!verseQuery) return false;
    if (verseQuery === props.verse.verse.toString()) return true;
    if (!verseQuery.includes('-') && !verseQuery.includes(';')) return false;
    const verseQueryParts = verseQuery.split(';').map(v => v.trim());
    if (verseQueryParts.length > 1) {
        return verseQueryParts.some((part) => {
            const versesArray = part.split('-').map(v => v.trim());
            const allVerses = [];
            for (let i = Number(versesArray[0]); i <= Number(versesArray[versesArray.length - 1]); i++) {
                allVerses.push(i.toString());
            }
            return allVerses.includes(props.verse.verse.toString());
        });
    }
    const versesArray = verseQuery.split('-').map(v => v.trim());
    const allVerses = [];
    for (let i = Number(versesArray[0]); i <= Number(versesArray[versesArray.length - 1]); i++) {
        allVerses.push(i.toString());
    }
    return allVerses.includes(props.verse.verse.toString());
});
</script>

<style>

</style>

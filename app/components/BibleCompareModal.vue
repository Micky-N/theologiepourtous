<template>
    <UModal
        v-model:open="showModal"
        title="Comparer ce passage"
        description="Terme théologique"
        :ui="{
            description: 'hidden',
            content: 'max-w-2xl'
        }"
    >
        <template #content>
            <div class="p-6">
                <div class="space-y-4">
                    <div>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Passage sélectionné :
                        </p>
                        <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p class="font-medium">
                                {{ book.name }} {{ chapter }}:{{ verseStart }}
                                <span v-if="verseEnd && verseEnd !== verseStart">
                                    -{{ verseEnd }}
                                </span>
                            </p>
                        </div>
                    </div>

                    <UFormField label="Versions à comparer (sélectionnez 2 à 6 versions)">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                            <div
                                v-for="availableVersion in availableVersions"
                                :key="availableVersion.id"
                                class="flex items-center space-x-2"
                            >
                                <UCheckbox
                                    :model-value="selectedVersions.includes(availableVersion.id)"
                                    :disabled="selectedVersions.length >= 6 && !selectedVersions.includes(availableVersion.id)"
                                    @update:model-value="toggleVersion(availableVersion.id)"
                                />
                                <div
                                    class="flex-1"
                                    @click="toggleVersion(availableVersion.id)"
                                >
                                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                                        {{ availableVersion.name }}
                                    </div>
                                    <div class="text-xs text-gray-500 dark:text-gray-400">
                                        {{ availableVersion.code }} • {{ availableVersion.language }}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="mt-2 text-xs text-gray-500">
                            {{ selectedVersions.length }} version(s) sélectionnée(s)
                            (minimum 2, maximum 6)
                        </div>
                    </UFormField>
                </div>

                <div class="flex justify-end gap-2 mt-6">
                    <UButton
                        label="Annuler"
                        variant="ghost"
                        @click="showModal = false"
                    />
                    <UButton
                        label="Comparer"
                        :disabled="selectedVersions.length < 2"
                        :loading="loading"
                        @click="performComparison"
                    />
                </div>
            </div>
        </template>
    </UModal>
</template>

<script setup lang="ts">
import type { BibleVersion } from '~~/src/database/models';

const props = defineProps<{
    availableVersions: BibleVersion[];
    book: { code: string; name: string; };
    chapter: number;
    version: number;
    verseStart: number;
    verseEnd?: number;
}>();

// État local
const showModal = defineModel<boolean>({ default: false });
const loading = ref(false);
const selectedVersions = ref<number[]>([props.version]);

// Méthodes
const toggleVersion = (versionId: number) => {
    const index = selectedVersions.value.indexOf(versionId);
    if (index > -1) {
        selectedVersions.value.splice(index, 1);
    } else if (selectedVersions.value.length < 6) {
        selectedVersions.value.push(versionId);
    }
};

const performComparison = async () => {
    if (selectedVersions.value.length < 2) return;

    try {
        loading.value = true;

        const versionsCode = props.availableVersions
            .filter(v => selectedVersions.value.includes(v.id))
            .map(v => v.code);

        // Construire les paramètres de comparaison
        const params = new URLSearchParams({
            book: props.book.code,
            chapter: props.chapter.toString(),
            verses: props.verseStart.toString(),
            versions: versionsCode.join(',')
        });

        if (props.verseEnd && props.verseEnd !== props.verseStart) {
            params.set('verses', props.verseStart.toString() + '-' + props.verseEnd.toString());
        }

        // Naviguer vers la page de comparaison avec les paramètres
        await navigateTo(`/bible/compare?${params.toString()}`);
    } catch (error) {
        console.error('Erreur lors de la comparaison:', error);
    } finally {
        loading.value = false;
        showModal.value = false;
    }
};

watch(() => props.version, (newVersion) => {
    selectedVersions.value = [newVersion];
});
</script>

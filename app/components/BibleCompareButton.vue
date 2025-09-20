<template>
    <div class="inline-block">
        <UButton
            icon="i-lucide-git-compare"
            label="Comparer les versions"
            variant="outline"
            size="sm"
            @click="startComparison"
        />

        <!-- Modal de sélection rapide -->
        <UModal v-model="showModal">
            <div class="p-6">
                <h3 class="text-lg font-semibold mb-4">
                    Comparer ce passage
                </h3>

                <div class="space-y-4">
                    <div>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Passage sélectionné :
                        </p>
                        <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p class="font-medium">
                                {{ bookName }} {{ chapter }}:{{ verseStart }}
                                <span v-if="verseEnd && verseEnd !== verseStart">
                                    -{{ verseEnd }}
                                </span>
                            </p>
                        </div>
                    </div>

                    <UFormField label="Versions à comparer (sélectionnez 2 à 6 versions)">
                        <div class="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                            <div
                                v-for="version in availableVersions"
                                :key="version.id"
                                class="flex items-center space-x-2"
                            >
                                <UCheckbox
                                    :model-value="selectedVersions.includes(version.id)"
                                    :disabled="selectedVersions.length >= 6 && !selectedVersions.includes(version.id)"
                                    @update:model-value="toggleVersion(version.id)"
                                />
                                <div class="flex-1">
                                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                                        {{ version.name }}
                                    </div>
                                    <div class="text-xs text-gray-500 dark:text-gray-400">
                                        {{ version.code }} • {{ version.language }}
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
        </UModal>
    </div>
</template>

<script setup lang="ts">
// Types
interface BibleVersion {
    id: number
    code: string
    name: string
    description: string | null
    language: string
    year: number | null
}

interface ApiResponse {
    data: BibleVersion[]
    success: boolean
    count: number
}

const props = defineProps({
    bookCode: {
        type: String,
        required: true
    },
    bookName: {
        type: String,
        required: true
    },
    chapter: {
        type: Number,
        required: true
    },
    verseStart: {
        type: Number,
        required: true
    },
    verseEnd: {
        type: Number,
        default: null
    }
})

// État local
const showModal = ref(false)
const loading = ref(false)
const selectedVersions = ref<number[]>([])
const availableVersions = ref<BibleVersion[]>([])

// Lifecycle
onMounted(() => {
    loadVersions()
})

// Méthodes
const toggleVersion = (versionId: number) => {
    const index = selectedVersions.value.indexOf(versionId)
    if (index > -1) {
        selectedVersions.value.splice(index, 1)
    } else if (selectedVersions.value.length < 6) {
        selectedVersions.value.push(versionId)
    }
}

const startComparison = () => {
    showModal.value = true
}

const loadVersions = async () => {
    try {
        const response = await $fetch<ApiResponse>('/api/bible/versions')
        availableVersions.value = response.data

        // Pré-sélectionner des versions populaires
        const defaultVersions = availableVersions.value
            .filter(v => ['LSG', 'S21', 'NBS'].includes(v.code))
            .slice(0, 2)
            .map(v => v.id)

        if (defaultVersions.length >= 2) {
            selectedVersions.value = defaultVersions
        }
    } catch (error) {
        console.error('Erreur lors du chargement des versions:', error)
    }
}

const performComparison = async () => {
    if (selectedVersions.value.length < 2) return

    try {
        loading.value = true

        // Construire les paramètres de comparaison
        const params = new URLSearchParams({
            book: props.bookCode,
            chapter: props.chapter.toString(),
            start: props.verseStart.toString(),
            versions: selectedVersions.value.join(',')
        })

        if (props.verseEnd && props.verseEnd !== props.verseStart) {
            params.append('end', props.verseEnd.toString())
        }

        // Naviguer vers la page de comparaison avec les paramètres
        await navigateTo(`/bible/compare?${params.toString()}`)
    } catch (error) {
        console.error('Erreur lors de la comparaison:', error)
    } finally {
        loading.value = false
        showModal.value = false
    }
}
</script>

<template>
    <UPopover
        v-model:open="open"
        mode="hover"
    >
        <a
            :id="verse"
            class="hover:underline"
        >
            <slot />
        </a>

        <template #content>
            <div
                class="w-72 max-w-xs p-2"
            >
                <div
                    v-if="loading"
                    class="flex items-center gap-2 text-gray-600"
                >
                    <UIcon
                        name="i-heroicons-arrow-path-20-solid"
                        class="animate-spin"
                    />
                    <span>Chargement du verset…</span>
                </div>

                <div
                    v-else-if="error"
                    class="text-sm text-red-600"
                >
                    {{ error }}
                </div>

                <div
                    v-else-if="data"
                    class="space-y-1"
                >
                    <div class="text-xs text-gray-500">
                        {{ data.reference }}<span v-if="data.version"> — {{ data.version }}</span>
                    </div>
                    <div class="italic text-gray-800 leading-relaxed">
                        {{ data.text }}
                    </div>
                </div>
            </div>
        </template>
    </UPopover>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

type VerseData = {
    reference: string
    text: string
    version: string
}

const { verse } = defineProps<{
    verse: string
}>()

const open = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const data = ref<VerseData | null>(null)

// Cache simple en mémoire pour éviter les appels répétés
const cache = useState('cache', () => new Map<string, VerseData>())

async function fetchVerseFromApiSim(verseRef: string): Promise<VerseData> {
    // Simule un délai réseau de 1 seconde
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Données factices pour quelques références courantes
    const presets: Record<string, VerseData> = {
        'Psaume 139:1-6': {
            reference: 'Psaume 139:1-6',
            text: 'Éternel ! tu me sondes et tu me connais… tu pénètres de loin ma pensée.',
            version: 'LSG'
        },
        'Ésaïe 46:9-10': {
            reference: 'Ésaïe 46:9-10',
            text: 'J’annonce dès le commencement ce qui doit arriver, et longtemps d’avance ce qui n’est pas encore accompli…',
            version: 'LSG'
        },
        'Hébreux 4:13': {
            reference: 'Hébreux 4:13',
            text: 'Nulle créature n’est cachée devant lui, mais tout est nu et à découvert à ses yeux.',
            version: 'LSG'
        }
    }

    return presets[verseRef] ?? {
        reference: verseRef,
        text: 'Verset non trouvé',
        version: 'LSG'
    }
}

async function ensureVerseLoaded() {
    error.value = null
    if (cache.value.has(verse)) {
        data.value = cache.value.get(verse) as VerseData
        return
    }
    loading.value = true
    data.value = null
    try {
        const res = await fetchVerseFromApiSim(verse)
        cache.value.set(verse, res)
        data.value = res
    } catch {
        error.value = 'Impossible de charger le verset.'
    } finally {
        loading.value = false
    }
}

// Charge lorsque le popover s’ouvre
watch(open, (val) => {
    if (val) {
        ensureVerseLoaded()
    }
})

// Réinitialise les données si la référence change
watch(() => verse, () => {
    data.value = cache.value.get(verse) ?? null
    error.value = null
})
</script>

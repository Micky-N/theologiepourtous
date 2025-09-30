<template>
    <UForm
        :state="form"
        @submit.prevent="handleSubmit"
    >
        <UCard
            :ui="{
                header: 'p-2 sm:px-4',
                footer: 'p-2 sm:px-4'
            }"
        >
            <template #header>
                <div class="flex items-center gap-2">
                    <UIcon
                        name="i-lucide-bookmark"
                        class="text-primary-600"
                    />
                    <span class="font-semibold text-sm">Ajouter aux signets</span>
                </div>
            </template>
            <template #default>
                <UFormField
                    label="Titre (optionnel)"
                    name="title"
                    class="mb-4"
                >
                    <UInput
                        v-model="form.title"
                        placeholder="Titre personnalisé..."
                        class="w-full"
                    />
                </UFormField>
                <UFormField
                    label="Couleur du favori"
                    name="color"
                >
                    <USelectMenu
                        v-model="form.color"
                        :items="colorOptions"
                        label-key="label"
                        value-key="value"
                        class="flex gap-2 w-full"
                    />
                    <div class="mt-2 flex items-center gap-1">
                        Aperçu&nbsp;:
                        <span
                            :style="[
                                `background-color: var(--color-${form.color}-400)`,
                                `border: solid 1px var(--color-${form.color}-700)`
                            ]"
                            class="inline-block size-4 rounded-full border"
                        />
                    </div>
                </UFormField>
            </template>
            <template #footer>
                <UButton
                    type="submit"
                    color="primary"
                    :loading="loading"
                    class="w-full flex justify-center"
                >
                    Ajouter
                </UButton>
            </template>
        </UCard>
    </UForm>
</template>

<script lang="ts" setup>
const props = defineProps<{
    verseId: number;
}>();

const emit = defineEmits<{
    (e: 'closeForm'): void;
    (e: 'created', bookmark: any): void;
}>();

const open = defineModel<boolean>({ default: false });

const form = reactive({
    title: '',
    color: 'blue'
});

const colorOptions = [
    { label: 'Rouge', value: 'red' },
    { label: 'Rose', value: 'pink' },
    { label: 'Fuchsia', value: 'fuchsia' },
    { label: 'Violet', value: 'purple' },
    { label: 'Violet clair', value: 'violet' },
    { label: 'Indigo', value: 'indigo' },
    { label: 'Bleu', value: 'blue' },
    { label: 'Ciel', value: 'sky' },
    { label: 'Cyan', value: 'cyan' },
    { label: 'Teal', value: 'teal' },
    { label: 'Émeraude', value: 'emerald' },
    { label: 'Vert', value: 'green' },
    { label: 'Lime', value: 'lime' },
    { label: 'Jaune', value: 'yellow' },
    { label: 'Ambre', value: 'amber' },
    { label: 'Orange', value: 'orange' },
    { label: 'Brun', value: 'brown' },
    { label: 'Gris', value: 'gray' },
    { label: 'Gris neutre', value: 'neutral' },
    { label: 'Ardoise', value: 'slate' },
    { label: 'Pierre', value: 'stone' },
    { label: 'Zinc', value: 'zinc' },
    { label: 'Noir', value: 'black' }
];

const loading = ref(false);
const error = ref('');
const toast = useToast();

function closeForm() {
    open.value = false;
    emit('closeForm');
}

async function handleSubmit() {
    error.value = '';
    loading.value = true;
    try {
        const response = await $fetch('/api/bible/bookmarks', {
            method: 'POST',
            body: {
                verseId: props.verseId,
                title: form.title,
                color: form.color
            }
        });
        if (response.success) {
            toast.add({ title: 'Favori ajouté', description: response.message, color: 'primary' });
            emit('created', response.data);
            closeForm();
        } else {
            error.value = response.message || 'Erreur inconnue';
        }
    } catch (e: any) {
        error.value = e?.statusMessage || 'Erreur lors de l’ajout du favori';
    } finally {
        loading.value = false;
    }
}
</script>

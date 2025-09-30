import type { BibleVersion } from '@prisma/client';

export const useBibleVersions = () => {
    const versions = ref<BibleVersion[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const fetchVersions = async () => {
        if (versions.value.length > 0) return versions.value;

        loading.value = true;
        error.value = null;

        try {
            const result = await $fetch<{ data: BibleVersion[] }>('/api/bible/versions');
            versions.value = result.data;
            return result.data;
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erreur lors de la récupération des versions';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    return {
        versions: readonly(versions),
        loading: readonly(loading),
        error: readonly(error),
        fetchVersions
    };
};

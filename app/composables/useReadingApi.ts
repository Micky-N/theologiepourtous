import type {
    ComparisonRequest,
    BibleComparison
} from '~/types';

/**
 * Composable pour la comparaison de versions bibliques
 */
export const useBibleComparison = () => {
    const comparison = ref<BibleComparison | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const compareVerses = async (request: ComparisonRequest) => {
        loading.value = true;
        error.value = null;

        try {
            const result = await $fetch<BibleComparison>('/api/bible/compare', {
                method: 'POST',
                body: request
            });
            comparison.value = result;
            return result;
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erreur lors de la comparaison';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    return {
        comparison: readonly(comparison),
        loading: readonly(loading),
        error: readonly(error),
        compareVerses
    };
};

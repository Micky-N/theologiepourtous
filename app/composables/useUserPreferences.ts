import type { AuthenticatedUserData, UserPreferencesData } from '~/types';
import type { BackendPreferenceSettings } from '~/composables/useSanctumBibleData';

export const useUserPreferences = () => {
    const client = useSanctumClient();
    const user = useSanctumUser<AuthenticatedUserData>();
    const { getVersionByCode, mapPreferenceSettings } = useSanctumBibleData();
    const preferences = ref<UserPreferencesData>({
        preferred_version: 'LSG',
        theme: 'light',
        resolvedPreferredVersion: null
    });

    const syncUserPreferences = (value: UserPreferencesData) => {
        preferences.value = value;

        if (user.value) {
            user.value = {
                ...user.value,
                preferences: value
            };
        }
    };

    const updatePreferences = async (
        payload: Pick<UserPreferencesData, 'preferred_version' | 'theme'>
    ) => {
        const preferredVersion = payload.preferred_version
            ? await getVersionByCode(payload.preferred_version)
            : null;

        const theme = payload.theme;

        if (payload.preferred_version && !preferredVersion) {
            throw createError({
                statusCode: 404,
                message: 'Version biblique non trouvée'
            });
        }

        const response = await client<BackendPreferenceSettings>('/preference-settings', {
            method: 'PATCH',
            body: {
                preferred_version: preferredVersion?.code ?? null,
                theme
            }
        });

        const mappedPreferences = await mapPreferenceSettings(response);

        syncUserPreferences({
            ...mappedPreferences,
            theme: payload.theme
        });

        return preferences.value;
    };

    const fetchPreferences = async () => {
        const response = await client<BackendPreferenceSettings | null>('/preference-settings', { method: 'GET' });
        const mappedPreferences = await mapPreferenceSettings(response);

        syncUserPreferences(mappedPreferences);

        return preferences.value;
    };

    return {
        preferences: readonly(preferences),
        updatePreferences,
        fetchPreferences
    };
};

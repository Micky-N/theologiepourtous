import type { AuthenticatedUserData, UserPreferencesData } from '~/types';
import type { BackendPreferenceSettings } from '~/composables/useSanctumBibleData';

export const useUserPreferences = () => {
    const client = useSanctumClient();
    const user = useSanctumUser<AuthenticatedUserData>();
    const { getVersionByCode, mapPreferenceSettings } = useSanctumBibleData();
    const preferences = ref<UserPreferencesData>({
        preferred_version: 'LSG',
        theme: 'light',
        defaultVersion: null,
        notesPerVersion: false,
        bookmarksPerVersion: false
    });

    type LocalPreferenceFlags = {
        notesPerVersion?: boolean;
        bookmarksPerVersion?: boolean;
    };

    const localFlags = useLocalStorage<Record<string, LocalPreferenceFlags>>('theologie-reading-preferences', {});

    const getPreferenceFlags = () => {
        const userId = user.value?.id ?? 'guest';
        const flags = localFlags.value[userId];

        return {
            notesPerVersion: flags?.notesPerVersion ?? false,
            bookmarksPerVersion: flags?.bookmarksPerVersion ?? false
        };
    };

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
        payload: Pick<UserPreferencesData, 'preferred_version' | 'theme'> & Partial<Pick<UserPreferencesData, 'notesPerVersion' | 'bookmarksPerVersion'>>
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

        const response = await client<{ data: BackendPreferenceSettings; }>('/preference-settings', {
            method: 'PATCH',
            body: {
                preferred_version: preferredVersion?.code ?? null,
                theme
            }
        });

        const mappedPreferences = await mapPreferenceSettings(response.data ?? null);
        const userId = user.value?.id ?? 'guest';
        const currentFlags = getPreferenceFlags();
        localFlags.value = {
            ...localFlags.value,
            [userId]: {
                notesPerVersion: payload.notesPerVersion ?? currentFlags.notesPerVersion,
                bookmarksPerVersion: payload.bookmarksPerVersion ?? currentFlags.bookmarksPerVersion
            }
        };

        syncUserPreferences({
            ...mappedPreferences,
            theme: payload.theme,
            notesPerVersion: payload.notesPerVersion ?? currentFlags.notesPerVersion,
            bookmarksPerVersion: payload.bookmarksPerVersion ?? currentFlags.bookmarksPerVersion
        });

        return preferences.value;
    };

    const fetchPreferences = async () => {
        const response = await client<{ data: BackendPreferenceSettings | null; }>('/preference-settings', { method: 'GET' });
        const mappedPreferences = await mapPreferenceSettings(response.data ?? null);
        const flags = getPreferenceFlags();

        syncUserPreferences({
            ...mappedPreferences,
            notesPerVersion: flags.notesPerVersion,
            bookmarksPerVersion: flags.bookmarksPerVersion
        });

        return preferences.value;
    };

    return {
        preferences: readonly(preferences),
        updatePreferences,
        fetchPreferences
    };
};

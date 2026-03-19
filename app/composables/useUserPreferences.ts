import type { UserPreferencesData } from '~/types';

export const useUserPreferences = () => {
    const preferences = ref<UserPreferencesData>({
        defaultVersionOrderIndex: null,
        notesPerVersion: false,
        bookmarksPerVersion: false,
        defaultVersion: null
    });

    const updatePreferences = async (
        payload: Pick<UserPreferencesData, 'defaultVersionOrderIndex' | 'notesPerVersion' | 'bookmarksPerVersion'>
    ) => {
        const { data } = await $fetch<{ data: UserPreferencesData; }>('/api/preferences', { method: 'PUT', body: payload });
        preferences.value.defaultVersionOrderIndex = data.defaultVersionOrderIndex;
        preferences.value.notesPerVersion = data.notesPerVersion;
        preferences.value.bookmarksPerVersion = data.bookmarksPerVersion;
        preferences.value.defaultVersion = data.defaultVersion;
    };

    const fetchPreferences = async () => {
        const { data } = await $fetch('/api/preferences', { method: 'GET' });
        preferences.value.defaultVersionOrderIndex = data.defaultVersionOrderIndex;
        preferences.value.notesPerVersion = data.notesPerVersion;
        preferences.value.bookmarksPerVersion = data.bookmarksPerVersion;
        preferences.value.defaultVersion = data.defaultVersion;
        return preferences.value;
    };

    return {
        preferences: readonly(preferences),
        updatePreferences,
        fetchPreferences
    };
};

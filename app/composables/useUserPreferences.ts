import type { BibleVersion, UserPreference } from '~~/src/database/models';

export const useUserPreferences = () => {
    const preferences = ref<Pick<UserPreference, 'defaultVersionId' | 'notesPerVersion' | 'bookmarksPerVersion'> & { defaultVersion: BibleVersion | null; }>({
        defaultVersionId: null,
        notesPerVersion: false,
        bookmarksPerVersion: false,
        defaultVersion: null
    });

    const updatePreferences = async (
        payload: Pick<UserPreference, 'defaultVersionId' | 'notesPerVersion' | 'bookmarksPerVersion'>
    ) => {
        const { data } = await $fetch<{ data: { defaultVersionId: BibleVersion['id'] | null; notesPerVersion: boolean; bookmarksPerVersion: boolean; }; }>('/api/preferences', { method: 'PUT', body: payload });
        preferences.value.defaultVersionId = data.defaultVersionId;
        preferences.value.notesPerVersion = data.notesPerVersion;
        preferences.value.bookmarksPerVersion = data.bookmarksPerVersion;
    };

    const fetchPreferences = async () => {
        const { data } = await $fetch<{ data: { defaultVersionId: BibleVersion['id'] | null; notesPerVersion: boolean; bookmarksPerVersion: boolean; defaultVersion: BibleVersion | null; }; }>('/api/preferences', { method: 'GET' });
        preferences.value.defaultVersionId = data.defaultVersionId;
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

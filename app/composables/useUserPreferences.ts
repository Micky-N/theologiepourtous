import type { BibleVersion, UserPreference } from '@prisma/client';

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
        const { data } = await $fetch<{ data: UserPreference; }>('/api/preferences', { method: 'PUT', body: payload });
        preferences.value.defaultVersionId = data.defaultVersionId;
        preferences.value.notesPerVersion = data.notesPerVersion;
        preferences.value.bookmarksPerVersion = data.bookmarksPerVersion;
    };

    const fetchPreferences = async () => {
        const { data } = await $fetch('/api/preferences', { method: 'GET' });
        preferences.value.defaultVersionId = data.defaultVersionId;
        preferences.value.notesPerVersion = data.notesPerVersion;
        preferences.value.bookmarksPerVersion = data.bookmarksPerVersion;
        preferences.value.defaultVersion = data.defaultVersion as BibleVersion | null;
        return preferences.value;
    };

    return {
        preferences: readonly(preferences),
        updatePreferences,
        fetchPreferences
    };
};

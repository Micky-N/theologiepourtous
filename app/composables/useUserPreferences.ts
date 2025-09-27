import type { UserPreference } from '@prisma/client';

export const useUserPreferences = () => {
    const preferences = ref<Pick<UserPreference, 'defaultVersionId' | 'notesPerVersion' | 'bookmarksPerVersion'>>({
        defaultVersionId: null,
        notesPerVersion: false,
        bookmarksPerVersion: false
    });

    const updatePreferences = async (
        payload: Pick<UserPreference, 'defaultVersionId' | 'notesPerVersion' | 'bookmarksPerVersion'>
    ) => {
        const { data } = await $fetch<{ data: UserPreference }>('/api/preferences', { method: 'PUT', body: payload });
        preferences.value.defaultVersionId = data.defaultVersionId;
        preferences.value.notesPerVersion = data.notesPerVersion;
        preferences.value.bookmarksPerVersion = data.bookmarksPerVersion;
    };

    const fetchPreferences = async () => {
        const { data } = await $fetch<{ data: UserPreference }>('/api/preferences', { method: 'GET' });
        preferences.value.defaultVersionId = data.defaultVersionId;
        preferences.value.notesPerVersion = data.notesPerVersion;
        preferences.value.bookmarksPerVersion = data.bookmarksPerVersion;
        return preferences.value;
    };

    return {
        preferences: readonly(preferences),
        updatePreferences,
        fetchPreferences
    };
};

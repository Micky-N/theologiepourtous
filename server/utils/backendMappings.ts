import {
    buildVersionPayload,
    getBibleVersionByCode,
    getBibleVersionByOrderIndex,
    getDefaultBibleVersion
} from '~~/server/utils/bibleData';

export type BackendUser = {
    id: string;
    name: string;
    email: string;
    role: string;
    created_at: string;
    updated_at: string;
};

export type BackendPreferenceSettings = {
    id: string;
    user_id: string;
    preferred_version: string | null;
    theme: string | null;
    created_at: string;
    updated_at: string;
};

export type BackendMappedPreferenceSettings = {
    defaultVersionOrderIndex: number | null;
    notesPerVersion: boolean;
    bookmarksPerVersion: boolean;
    defaultVersion: Awaited<ReturnType<typeof buildVersionPayload>> | null;
    createdAt: string | undefined;
    updatedAt: string | undefined;
};

export type BackendSessionUser = {
    id: string;
    name: string;
    email: string;
    role: string;
    preferences: BackendMappedPreferenceSettings;
};

export const resolvePreferredVersion = async (params?: {
    preferredVersionCode?: string | null;
    defaultVersionOrderIndex?: number | null;
    queryVersionCode?: string | null;
}) => {
    if (params?.queryVersionCode) {
        const version = await getBibleVersionByCode(params.queryVersionCode);
        if (version) {
            return version;
        }
    }

    if (params?.preferredVersionCode) {
        const version = await getBibleVersionByCode(params.preferredVersionCode);
        if (version) {
            return version;
        }
    }

    if (params?.defaultVersionOrderIndex) {
        const version = await getBibleVersionByOrderIndex(params.defaultVersionOrderIndex);
        if (version) {
            return version;
        }
    }

    return getDefaultBibleVersion();
};

export const mapPreferenceSettings = async (preferences: BackendPreferenceSettings | null): Promise<BackendMappedPreferenceSettings> => {
    const version = await resolvePreferredVersion({
        preferredVersionCode: preferences?.preferred_version ?? null
    });

    return {
        defaultVersionOrderIndex: version?.orderIndex ?? null,
        notesPerVersion: false,
        bookmarksPerVersion: false,
        defaultVersion: version ? buildVersionPayload(version) : null,
        createdAt: preferences?.created_at,
        updatedAt: preferences?.updated_at
    };
};

import type { BibleVersion, UserPreference, User as UserModel } from '~~/src/database/models';

declare module '#auth-utils' {
    interface User extends Pick<UserModel, 'id' | 'name' | 'email' | 'role'> {
        preferences: Pick<UserPreference, 'defaultVersionId' | 'notesPerVersion' | 'bookmarksPerVersion'> & { defaultVersion: BibleVersion | null; };
    }

    interface UserSession {
        user: User;
        token: string;
    }
}

export {};

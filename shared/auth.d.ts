import type { BibleVersion, UserPreference, User as UserPrisma } from '@prisma/client';

declare module '#auth-utils' {
    interface User extends Pick<UserPrisma, 'id' | 'name' | 'email' | 'role'> {
        preferences: Pick<UserPreference, 'defaultVersionId' | 'notesPerVersion' | 'bookmarksPerVersion'> & { defaultVersion: BibleVersion | null }
    }

    interface UserSession {
        user: User
        token: string
    }
}

export {};

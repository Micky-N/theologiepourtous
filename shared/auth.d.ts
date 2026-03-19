import type { UserPreference, User as UserPrisma } from '@prisma/client';

type SessionBibleVersion = {
    id: number;
    code: string;
    name: string;
    language: string;
    year: number | null;
    isActive?: boolean;
    orderIndex?: number;
    createdAt?: string | Date;
    updatedAt?: string | Date;
};

declare module '#auth-utils' {
    interface User extends Pick<UserPrisma, 'id' | 'name' | 'email' | 'role'> {
        preferences: Pick<UserPreference, 'defaultVersionOrderIndex' | 'notesPerVersion' | 'bookmarksPerVersion'> & { defaultVersion: SessionBibleVersion | null; };
    }

    interface UserSession {
        user: User;
        token: string;
    }
}

export {};

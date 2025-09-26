import type { User as UserPrisma } from '@prisma/client';

declare module '#auth-utils' {
    interface User extends Pick<UserPrisma, 'id' | 'name' | 'email' | 'role'> {
        name: string
    }

    interface UserSession {
        user: User
        token: string
    }
}

export {};

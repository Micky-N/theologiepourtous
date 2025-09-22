declare module '#auth-utils' {
    interface User {
        id: number
        name: string
        email: string
        role: string
    }

    interface UserSession {
        user: User
        token: string
    }
}

export {};

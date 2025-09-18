import type { ParsedContent } from '@nuxt/content'
import type { Avatar, Badge, Link } from '#ui/types'

// Re-export des types Prisma
export * from './models'

export interface User {
    id: number
    name: string
    email: string
    password: string
    role: 'USER' | 'ADMIN'
    createdAt: Date
    lastLogin?: Date | null
}

export type UserWithoutPassword = Omit<User, 'password'>

export interface Course {
    id: number
    title: string
    description: string
    slug: string
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
    estimatedTime: number
    imageUrl?: string | null
    isPublished: boolean
    createdAt: Date
    updatedAt: Date
}

export interface Lesson {
    id: number
    courseId: number
    title: string
    description: string
    content: string
    slug: string
    order: number
    duration?: number | null
    isPublished: boolean
    createdAt: Date
    updatedAt: Date
}

export interface BlogPost extends ParsedContent {
    title: string
    description: string
    date: string
    image?: HTMLImageElement
    badge?: Badge
    authors?: ({
        name: string
        description?: string
        avatar: Avatar
    } & Link)[]
}

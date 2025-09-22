import type { BibleBook, BibleBookmark, BibleNote, BibleReadingProgress, BibleVerse, BibleVersion } from '@prisma/client';

// ============================================================================
// ENUMS
// ============================================================================

export enum Testament {
    OLD = 'OLD',
    NEW = 'NEW'
}

// ============================================================================
// TYPES AVEC RELATIONS
// ============================================================================

export interface BibleVerseWithRelations extends BibleVerse {
    version?: BibleVersion
    book?: BibleBook
    bookmarks?: BibleBookmark[]
    notes?: BibleNote[]
}

export interface BibleBookWithRelations extends BibleBook {
    verses?: BibleVerse[]
    bookmarks?: BibleBookmark[]
    notes?: BibleNote[]
    readingProgress?: BibleReadingProgress[]
}

// ============================================================================
// TYPES UTILITAIRES
// ============================================================================

export interface ChapterReference {
    book: string
    chapter: number
}

export interface VerseReference extends ChapterReference {
    verse: number
}

export interface ReadingPeriod {
    startDate: Date
    endDate: Date
}

export interface ReadingAverages {
    readingTimePerDay: number
    versesPerSession: number
    averageReadingSpeed: number
}

// ============================================================================
// TYPES D'API
// ============================================================================

export interface ReadingStatsResponse {
    summary: {
        totalSessions: number
        totalReadingTime: number
        totalVersesRead: number
        currentStreak: number
        longestStreak: number
        averages: ReadingAverages
    }
    dailyStats: Array<{
        date: Date
        readingTime: number
        versesRead: number
        sessions: number
        chaptersCompleted: number
    }>
    bookProgress: Array<{
        book: string | BibleBook
        currentChapter: number
        currentVerse: number
        completionPercentage: number
        lastReadAt: Date
        isCompleted: boolean
    }>
    topBooks: Array<{
        name: string
        sessions: number
        totalTime: number
    }>
    timePreferences: Record<string, number>
}

export interface CreateReadingSessionPayload {
    versionId: number
    startTime?: Date
    deviceType?: string
}

export interface UpdateReadingSessionPayload {
    endTime?: Date
    duration?: number
    chaptersRead?: string[]
    versesRead?: number
    isCompleted?: boolean
}

// ============================================================================
// TYPES DE COMPARAISON BIBLIQUE
// ============================================================================

export interface BibleComparison {
    reference: VerseReference
    versions: Array<{
        version: BibleVersion
        text: string
    }>
}

export interface ComparisonRequest {
    book: string
    chapter: number
    verse: number
    versions: string[]
}

// ============================================================================
// TYPES DE RECHERCHE
// ============================================================================

export interface SearchFilters {
    query?: string
    book?: string
    testament?: Testament
    version?: string
    limit?: number
    offset?: number
}

export interface SearchResult {
    verse: BibleVerseWithRelations
    relevanceScore: number
    context: {
        previousVerse?: BibleVerse
        nextVerse?: BibleVerse
    }
}

// ============================================================================
// TYPES DE PRÉFÉRENCES
// ============================================================================

export interface ReadingPreferences {
    defaultVersion: string
    showVerseNumbers: boolean
    fontSize: 'small' | 'medium' | 'large'
    theme: 'light' | 'dark' | 'sepia'
    dailyReadingGoal: number
    notifications: {
        enabled: boolean
        reminderTime?: string
        frequency: 'daily' | 'weekly' | 'none'
    }
}

// ============================================================================
// TYPES D'EXPORT/IMPORT
// ============================================================================

export interface ExportOptions {
    format: 'json' | 'csv' | 'pdf'
    includeNotes: boolean
    includeBookmarks: boolean
    includeStats: boolean
    dateRange?: ReadingPeriod
}

export interface ImportData {
    bookmarks?: Omit<BibleBookmark, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[]
    notes?: Omit<BibleNote, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[]
    preferences?: Partial<ReadingPreferences>
}

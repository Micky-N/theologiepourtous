// Types générés à partir des modèles Prisma
// Pour une synchronisation automatique avec le schéma Prisma

// ============================================================================
// ENUMS
// ============================================================================

export enum Role {
    USER = 'USER',
    ADMIN = 'ADMIN'
}

export enum TokenType {
    EMAIL = 'EMAIL',
    API = 'API'
}

export enum Testament {
    OLD = 'OLD',
    NEW = 'NEW'
}

// ============================================================================
// MODÈLES DE BASE
// ============================================================================

export interface User {
    id: number
    email: string
    name: string
    password: string
    role: Role
    lastLogin: Date | null
    createdAt: Date
    updatedAt: Date
}

export interface Token {
    id: number
    createdAt: Date
    updatedAt: Date
    type: TokenType
    emailToken: string | null
    valid: boolean
    expiration: Date
    userId: number
}

export interface UserProgress {
    id: number
    theme: string
    percent: number
    completedAt: Date | null
    startedAt: Date | null
    createdAt: Date
    updatedAt: Date
    userId: number
}

// ============================================================================
// MODÈLES BIBLE
// ============================================================================

export interface BibleVersion {
    id: number
    code: string
    name: string
    language: string
    description: string | null
    year: number | null
    isActive: boolean
    orderIndex: number
    createdAt: Date
    updatedAt: Date
}

export interface BibleBook {
    id: number
    code: string
    name: string
    testament: Testament
    orderIndex: number
    chapterCount: number
    createdAt: Date
}

export interface BibleVerse {
    id: number
    chapter: number
    verse: number
    text: string
    createdAt: Date
    versionId: number
    bookId: number
}

export interface BibleBookmark {
    id: number
    title: string | null
    color: string | null
    createdAt: Date
    updatedAt: Date
    userId: number
    bookId: number
    verseId: number
}

export interface BibleNote {
    id: number
    title: string | null
    content: string
    isPrivate: boolean
    createdAt: Date
    updatedAt: Date
    userId: number
    bookId: number
    verseId: number
}

export interface UserBiblePreference {
    id: number
    defaultVersionId: number
    showVerseNumbers: boolean
    createdAt: Date
    updatedAt: Date
    userId: number
}

// ============================================================================
// MODÈLES STATISTIQUES DE LECTURE
// ============================================================================

export interface ReadingSession {
    id: number
    startTime: Date
    endTime: Date | null
    duration: number | null
    chaptersRead: string | null
    versesRead: number
    isCompleted: boolean
    deviceType: string | null
    createdAt: Date
    userId: number
    versionId: number
}

export interface ReadingStats {
    id: number
    date: Date
    totalReadingTime: number
    chaptersCompleted: number
    versesRead: number
    averageReadingSpeed: number | null
    longestSession: number
    sessionsCount: number
    booksStarted: string | null
    booksCompleted: string | null
    favoriteTestament: Testament | null
    favoriteReadingTime: string | null
    createdAt: Date
    updatedAt: Date
    userId: number
}

export interface BibleReadingProgress {
    id: number
    currentChapter: number
    currentVerse: number
    completedAt: Date | null
    startedAt: Date
    lastReadAt: Date
    totalReadTime: number
    chaptersRead: string | null
    isCompleted: boolean
    createdAt: Date
    updatedAt: Date
    userId: number
    bookId: number
}

// ============================================================================
// TYPES AVEC RELATIONS
// ============================================================================

export interface UserWithRelations extends User {
    tokens?: Token[]
    userProgress?: UserProgress[]
    bibleBookmarks?: BibleBookmark[]
    bibleNotes?: BibleNote[]
    userBiblePreference?: UserBiblePreference
    readingSessions?: ReadingSession[]
    readingStats?: ReadingStats[]
    bibleReadingProgress?: BibleReadingProgress[]
}

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

export interface ReadingSessionWithRelations extends ReadingSession {
    user?: User
    version?: BibleVersion
}

export interface BibleReadingProgressWithRelations extends BibleReadingProgress {
    user?: User
    book?: BibleBook
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

export interface ReadingStreak {
    currentStreak: number
    longestStreak: number
    streakStartDate: Date | null
    streakEndDate: Date | null
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
// TYPES D'AUTHENTIFICATION
// ============================================================================

export interface LoginRequest {
    email: string
    password: string
}

export interface RegisterRequest {
    email: string
    name: string
    password: string
}

export interface AuthResponse {
    user: Omit<User, 'password'>
    token: string
    expiresAt: Date
}

// ============================================================================
// TYPES DE VALIDATION
// ============================================================================

export interface ValidationError {
    field: string
    message: string
}

export interface ApiResponse<T = any> {
    success: boolean
    data?: T
    error?: string
    errors?: ValidationError[]
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

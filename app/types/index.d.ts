// ============================================================================
// ENUMS
// ============================================================================

export type Testament = 'OLD' | 'NEW';

export interface BibleBookData {
    orderIndexId: number;
    code: string;
    name: string;
    testament: Testament;
    orderIndex: number;
    chapterCount: number;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

export interface BibleVersionData {
    orderIndexId: number;
    code: string;
    name: string;
    language: string;
    year: number | null;
    isActive?: boolean;
    orderIndex?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface BibleVerseData {
    id: string;
    chapter: number;
    verse: number;
    text: string;
    createdAt: string | Date;
    versionId: string;
    bookId: string;
}

export interface BibleVerseWithContext extends BibleVerseData {
    book: BibleBookData;
    version: BibleVersionData;
}

export interface BibleNoteData {
    id: string;
    title: string | null;
    content: string;
    isPrivate: boolean;
    createdAt: string | Date;
    updatedAt: string | Date;
}

export interface BibleBookmarkData {
    id: string;
    title: string | null;
    color: string | null;
    createdAt: string | Date;
    updatedAt: string | Date;
}

export interface BibleVersePreview {
    chapter: number;
    verse: number;
    text: string;
    version: Pick<BibleVersionData, 'code' | 'name'>;
}

export interface BibleNoteWithVersePreview extends BibleNoteData {
    book: BibleBookData;
    verse: BibleVersePreview;
}

export interface BibleBookmarkWithVersePreview extends BibleBookmarkData {
    reference: string;
    book: BibleBookData;
    verse: BibleVersePreview;
}

export interface UserPreferencesData {
    preferred_version: string | undefined;
    theme: 'light' | 'dark' | 'system';
    resolvedPreferredVersion: BibleVersionData | null;
}

export interface AuthenticatedUserData {
    id: string;
    name: string;
    email: string;
    role: string;
    preferences: UserPreferencesData;
}

export interface UserProgress {
    id: string;
    userId: string;
    theme: string;
    lessons: string;
    startedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface BibleVerseResponseData {
    book: {
        name: string;
        code: string;
        testament: Testament;
    };
    chapter: number;
    version: {
        name: string;
        code: string;
    };
    verses: BibleVerseData[];
    navigation: {
        previousChapter: number | null;
        nextChapter: number | null;
        totalChapters: number;
    };
}

// ============================================================================
// TYPES AVEC RELATIONS
// ============================================================================

export interface BibleVerseWithRelations extends BibleVerse {
    version?: BibleVersionData;
    book?: BibleBookData;
    bookmarks?: BibleBookmarkData[];
    notes?: BibleNoteData[];
}

export interface BibleBookWithRelations extends BibleBookData {
    verses?: BibleVerseData[];
    bookmarks?: BibleBookmarkData[];
    notes?: BibleNoteData[];
}

// ============================================================================
// TYPES UTILITAIRES
// ============================================================================

export interface ChapterReference {
    book: string;
    chapter: number;
}

export interface VerseReference extends ChapterReference {
    verse: number;
}

export interface ReadingPeriod {
    startDate: Date;
    endDate: Date;
}

export interface ReadingAverages {
    readingTimePerDay: number;
    chaptersPerSession: number;
}

// ============================================================================
// TYPES DE COMPARAISON BIBLIQUE
// ============================================================================

export interface BibleComparison {
    reference: VerseReference;
    versions: Array<{
        version: BibleVersionData;
        text: string;
    }>;
}

export interface ComparisonRequest {
    book: string;
    chapter: number;
    verse: number;
    versions: string[];
}

// ============================================================================
// TYPES DE RECHERCHE
// ============================================================================

export interface SearchFilters {
    query?: string;
    book?: string;
    testament?: Testament;
    version?: string;
    limit?: number;
    offset?: number;
}

export interface SearchResult {
    verse: BibleVerseWithRelations;
    relevanceScore: number;
    context: {
        previousVerse?: BibleVerseData;
        nextVerse?: BibleVerseData;
    };
}

// ============================================================================
// TYPES DE PRÉFÉRENCES
// ============================================================================

export interface ReadingPreferences {
    preferredVersion: string;
    showVerseNumbers: boolean;
    fontSize: 'small' | 'medium' | 'large';
    theme: 'light' | 'dark' | 'sepia';
    dailyReadingGoal: number;
    notifications: {
        enabled: boolean;
        reminderTime?: string;
        frequency: 'daily' | 'weekly' | 'none';
    };
}

// ============================================================================
// TYPES D'EXPORT/IMPORT
// ============================================================================

export interface ExportOptions {
    format: 'json' | 'csv' | 'pdf';
    includeNotes: boolean;
    includeBookmarks: boolean;
    includeStats: boolean;
    dateRange?: ReadingPeriod;
}

export interface ImportData {
    bookmarks?: Array<Omit<BibleBookmarkData, 'id' | 'createdAt' | 'updatedAt'> & {
        bookId?: string;
        versionId?: string;
        chapter: number;
        verse: number;
    }>;
    notes?: Array<Omit<BibleNoteData, 'id' | 'createdAt' | 'updatedAt'> & {
        bookId?: string;
        versionId?: string;
        chapter: number;
        verse: number;
    }>;
    preferences?: Partial<ReadingPreferences>;
}

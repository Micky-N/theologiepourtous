import type {
    BibleBookData,
    BibleBookmarkWithVersePreview,
    BibleNoteWithVersePreview,
    BibleVerseResponseData,
    BibleVersionData,
    UserPreferencesData
} from '~/types';

export type BackendPreferenceSettings = {
    id: string;
    user_id: string;
    preferred_version: string | null;
    theme: 'light' | 'dark' | 'system';
    created_at: string;
    updated_at: string;
};

export type BackendBibleNote = {
    id: string;
    user_id: string;
    book_code: string;
    chapter: number;
    verse: number;
    title?: string | null;
    content?: string | null;
    is_public: boolean;
    created_at: string;
    updated_at: string;
};

export type BackendBibleBookmark = {
    id: string;
    user_id: string;
    book_code: string;
    chapter: number;
    verse: number;
    title?: string | null;
    color?: string | null;
    created_at: string;
    updated_at: string;
};

type ResolveVersionOptions = {
    preferredVersionCode?: string | null;
    fallbackVersionCode?: string | null;
    queryVersionCode?: string | null;
};

type BookmarkMetadata = {
    title: string | null;
    color: string | null;
};

const SYNTHETIC_VERSE_ID_SEPARATOR = ':';

export const useSanctumBibleData = () => {
    const books = useState<BibleBookData[]>('sanctum-bible-books', () => []);
    const versions = useState<BibleVersionData[]>('sanctum-bible-versions', () => []);
    const chapterCache = useState<Record<string, BibleVerseResponseData>>('sanctum-bible-chapters', () => ({}));

    const fetchBooks = async () => {
        if (books.value.length > 0) {
            return books.value;
        }

        const response = await $fetch<{ data: { all: BibleBookData[]; }; }>('/api/bible/books');
        books.value = response.data.all;
        return books.value;
    };

    const fetchVersions = async () => {
        if (versions.value.length > 0) {
            return versions.value;
        }

        const response = await $fetch<{ data: BibleVersionData[]; }>('/api/bible/versions');
        versions.value = response.data;
        return versions.value;
    };

    const fetchChapter = async (bookCode: string, chapter: number, versionCode: string) => {
        const cacheKey = `${bookCode.toUpperCase()}:${chapter}:${versionCode.toUpperCase()}`;

        if (chapterCache.value[cacheKey]) {
            return chapterCache.value[cacheKey];
        }

        const response = await $fetch<{ data: BibleVerseResponseData; }>(`/api/bible/verses/${bookCode}/${chapter}`, {
            query: {
                version: versionCode
            }
        });

        chapterCache.value[cacheKey] = response.data;
        return response.data;
    };

    const getBookByCode = async (bookCode: string) => {
        const data = await fetchBooks();
        return data.find(book => book.code === bookCode.toUpperCase()) ?? null;
    };

    const getVersionByCode = async (versionCode: string) => {
        const data = await fetchVersions();
        return data.find(version => version.code === versionCode.toUpperCase()) ?? null;
    };

    const getFallbackVersion = async () => {
        return await getVersionByCode('LSG');
    };

    const resolvePreferredVersion = async (options?: ResolveVersionOptions) => {
        if (options?.queryVersionCode) {
            const version = await getVersionByCode(options.queryVersionCode);
            if (version) {
                return version;
            }
        }

        if (options?.preferredVersionCode) {
            const version = await getVersionByCode(options.preferredVersionCode);
            if (version) {
                return version;
            }
        }

        if (options?.fallbackVersionCode) {
            const version = await getVersionByCode(options.fallbackVersionCode);
            if (version) {
                return version;
            }
        }

        return await getFallbackVersion();
    };

    const mapPreferenceSettings = async (preferences: BackendPreferenceSettings | null): Promise<UserPreferencesData> => {
        const version = await resolvePreferredVersion({
            preferredVersionCode: preferences?.preferred_version ?? 'LSG'
        });

        return {
            preferred_version: preferences?.preferred_version ?? 'LSG',
            theme: preferences?.theme ?? 'system',
            resolvedPreferredVersion: version ?? null
        };
    };

    const decodeSyntheticVerseId = (verseId: string) => {
        if (typeof verseId !== 'string') {
            return null;
        }

        const [bookCode, chapterValue, verseValue, versionCode] = verseId
            .split(SYNTHETIC_VERSE_ID_SEPARATOR)
            .map(part => part.trim());

        const chapter = Number.parseInt(chapterValue ?? '', 10);
        const verse = Number.parseInt(verseValue ?? '', 10);

        if (!bookCode || !versionCode || !Number.isInteger(chapter) || !Number.isInteger(verse) || chapter <= 0 || verse <= 0) {
            return null;
        }

        return {
            bookCode: bookCode.toUpperCase(),
            chapter,
            verse,
            versionCode: versionCode.toUpperCase()
        };
    };

    const resolveSyntheticVerseReference = async (verseId: string) => {
        const decoded = decodeSyntheticVerseId(verseId);
        if (!decoded) {
            return null;
        }

        const [book, version] = await Promise.all([
            getBookByCode(decoded.bookCode),
            getVersionByCode(decoded.versionCode)
        ]);

        if (!book || !version || decoded.chapter > book.chapterCount) {
            return null;
        }

        return {
            book,
            version,
            chapter: decoded.chapter,
            verse: decoded.verse
        };
    };

    const mapBibleNote = async (
        note: BackendBibleNote,
        options?: ResolveVersionOptions & { title?: string | null; }
    ): Promise<BibleNoteWithVersePreview | null> => {
        const book = await getBookByCode(note.book_code);
        const version = await resolvePreferredVersion(options);

        if (!book || !version) {
            return null;
        }

        const chapter = await fetchChapter(book.code, note.chapter, version.code);
        const verse = chapter.verses.find(item => item.verse === note.verse);

        return {
            id: note.id,
            title: note.title ?? options?.title ?? null,
            content: note.content ?? '',
            isPrivate: !note.is_public,
            createdAt: note.created_at,
            updatedAt: note.updated_at,
            book,
            verse: {
                chapter: note.chapter,
                verse: note.verse,
                text: verse?.text ?? '',
                version: {
                    code: version.code,
                    name: version.name
                }
            }
        };
    };

    const mapBibleBookmark = async (
        bookmark: BackendBibleBookmark,
        options?: ResolveVersionOptions & BookmarkMetadata
    ): Promise<BibleBookmarkWithVersePreview | null> => {
        const book = await getBookByCode(bookmark.book_code);
        const version = await resolvePreferredVersion(options);

        if (!book || !version) {
            return null;
        }

        const chapter = await fetchChapter(book.code, bookmark.chapter, version.code);
        const verse = chapter.verses.find(item => item.verse === bookmark.verse);

        return {
            id: bookmark.id,
            title: bookmark.title ?? options?.title ?? null,
            color: bookmark.color ?? options?.color ?? 'blue',
            reference: `${book.name} ${bookmark.chapter}:${bookmark.verse}`,
            book,
            verse: {
                chapter: bookmark.chapter,
                verse: bookmark.verse,
                text: verse?.text ?? '',
                version: {
                    code: version.code,
                    name: version.name
                }
            },
            createdAt: bookmark.created_at,
            updatedAt: bookmark.updated_at
        };
    };

    return {
        fetchBooks,
        fetchVersions,
        fetchChapter,
        getVersionByCode,
        resolvePreferredVersion,
        resolveSyntheticVerseReference,
        mapPreferenceSettings,
        mapBibleNote,
        mapBibleBookmark
    };
};

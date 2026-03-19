import { readFile } from 'node:fs/promises';
import path from 'node:path';

export type BibleBookRecord = {
    code: string;
    name: string;
    testament: 'OLD' | 'NEW';
    orderIndex: number;
    chapterCount: number;
};

export type BibleVersionRecord = {
    code: string;
    name: string;
    language: string;
    year: number | null;
    isActive: boolean;
    orderIndex: number;
};

type ChapterVerseRecord = {
    verse: number;
    texts: Record<string, string>;
};

type ChapterRecord = {
    bookCode: string;
    chapter: number;
    verses: ChapterVerseRecord[];
};

const DEFAULT_TIMESTAMP = new Date(0).toISOString();
const SYNTHETIC_VERSE_ID_BASE = 1_000_000;

let booksPromise: Promise<BibleBookRecord[]> | null = null;
let versionsPromise: Promise<BibleVersionRecord[]> | null = null;
const chaptersCache = new Map<string, Promise<ChapterRecord | null>>();

const loadJson = async <T>(relativePath: string): Promise<T> => {
    const filePath = path.join(process.cwd(), 'server', relativePath)
    const content = await readFile(new URL(filePath, import.meta.url), 'utf-8');
    return JSON.parse(content) as T;
};

export const getBibleBooks = async () => {
    booksPromise ??= loadJson<BibleBookRecord[]>('data/books.json');
    return booksPromise;
};

export const getBibleVersions = async () => {
    versionsPromise ??= loadJson<BibleVersionRecord[]>('data/versions.json');
    return versionsPromise;
};

export const getActiveBibleVersions = async () => {
    const versions = await getBibleVersions();
    return versions
        .filter(version => version.isActive)
        .sort((left, right) => left.orderIndex - right.orderIndex);
};

export const getBibleBookByCode = async (bookCode: string) => {
    const books = await getBibleBooks();
    return books.find(book => book.code === bookCode.toUpperCase()) ?? null;
};

export const getBibleBookByOrderIndex = async (orderIndex: number) => {
    const books = await getBibleBooks();
    return books.find(book => book.orderIndex === orderIndex) ?? null;
};

export const getBibleVersionByCode = async (versionCode: string) => {
    const versions = await getActiveBibleVersions();
    return versions.find(version => version.code === versionCode.toUpperCase()) ?? null;
};

export const getBibleVersionByOrderIndex = async (orderIndex: number) => {
    const versions = await getActiveBibleVersions();
    return versions.find(version => version.orderIndex === orderIndex) ?? null;
};

export const getDefaultBibleVersion = async () => {
    return getBibleVersionByCode('LSG');
};

export const getBibleChapter = async (bookCode: string, chapter: number) => {
    const normalizedBookCode = bookCode.toUpperCase();
    const cacheKey = `${normalizedBookCode}:${chapter}`;

    if (!chaptersCache.has(cacheKey)) {
        chaptersCache.set(cacheKey, (async () => {
            try {
                return await loadJson<ChapterRecord>(`data/bible/${normalizedBookCode}/${chapter}.json`);
            } catch (error: any) {
                if (error?.code === 'ENOENT') {
                    return null;
                }
                throw error;
            }
        })());
    }

    return chaptersCache.get(cacheKey) ?? null;
};

export const buildSyntheticVerseId = (bookOrderIndex: number, chapter: number, verse: number, versionOrderIndex: number) => {
    return (bookOrderIndex * SYNTHETIC_VERSE_ID_BASE) + (chapter * 1_000) + (verse * 10) + versionOrderIndex;
};

export const decodeSyntheticVerseId = (verseId: number) => {
    if (!Number.isInteger(verseId) || verseId < SYNTHETIC_VERSE_ID_BASE) {
        return null;
    }

    const versionOrderIndex = verseId % 10;
    const verse = Math.floor(verseId / 10) % 1_000;
    const chapter = Math.floor(verseId / 1_000) % 1_000;
    const bookOrderIndex = Math.floor(verseId / SYNTHETIC_VERSE_ID_BASE);

    if (bookOrderIndex <= 0 || chapter <= 0 || verse <= 0 || versionOrderIndex <= 0) {
        return null;
    }

    return {
        bookOrderIndex,
        chapter,
        verse,
        versionOrderIndex
    };
};

export const resolveSyntheticVerseReference = async (verseId: number) => {
    const decoded = decodeSyntheticVerseId(verseId);
    if (!decoded) {
        return null;
    }

    const [book, version] = await Promise.all([
        getBibleBookByOrderIndex(decoded.bookOrderIndex),
        getBibleVersionByOrderIndex(decoded.versionOrderIndex)
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

export const mapChapterVerses = (
    chapter: ChapterRecord,
    book: BibleBookRecord,
    version: BibleVersionRecord
) => {
    return chapter.verses
        .filter(item => typeof item.texts[version.code] === 'string')
        .sort((left, right) => left.verse - right.verse)
        .map(item => ({
            id: buildSyntheticVerseId(book.orderIndex, chapter.chapter, item.verse, version.orderIndex),
            chapter: chapter.chapter,
            verse: item.verse,
            text: item.texts[version.code],
            createdAt: DEFAULT_TIMESTAMP,
            versionId: version.orderIndex,
            bookId: book.orderIndex
        }));
};

export const getVerseText = async (
    bookCode: string,
    chapterNumber: number,
    verseNumber: number,
    versionCode: string
) => {
    const chapter = await getBibleChapter(bookCode, chapterNumber);
    if (!chapter) {
        return null;
    }

    const verse = chapter.verses.find(item => item.verse === verseNumber);
    return verse?.texts[versionCode] ?? null;
};

export const countVersesInChapter = async (bookCode: string, chapterNumber: number) => {
    const chapter = await getBibleChapter(bookCode, chapterNumber);
    return chapter?.verses.length ?? 0;
};

export const buildVersePreview = async (params: {
    bookCode: string;
    chapter: number;
    verse: number;
    versionCode: string;
    versionName: string;
}) => {
    const text = await getVerseText(params.bookCode, params.chapter, params.verse, params.versionCode);

    return {
        chapter: params.chapter,
        verse: params.verse,
        text: text ?? '',
        version: {
            code: params.versionCode,
            name: params.versionName
        }
    };
};

export const buildBookPayload = (book: BibleBookRecord) => ({
    id: book.orderIndex,
    code: book.code,
    name: book.name,
    testament: book.testament,
    orderIndex: book.orderIndex,
    chapterCount: book.chapterCount,
    createdAt: DEFAULT_TIMESTAMP,
    updatedAt: DEFAULT_TIMESTAMP
});

export const buildVersionPayload = (version: BibleVersionRecord) => ({
    id: version.orderIndex,
    code: version.code,
    name: version.name,
    language: version.language,
    year: version.year,
    isActive: version.isActive,
    orderIndex: version.orderIndex,
    createdAt: DEFAULT_TIMESTAMP,
    updatedAt: DEFAULT_TIMESTAMP
});

import type { BibleBook } from '@prisma/client';

export type VerseObject = {
    book: string | null;
    chapter: number | null;
    verse: string | null;
    version: string | null;
};

const booksData: BibleBook[] = [];

export const setBooksData = (data: BibleBook[]) => {
    booksData.push(...data);
};

/**
 * 1 Jean 1:1 -> /bible?book=1JN&chapter=1&verse=1
 * 1 Jean 1:1-3 -> /bible?book=1JN&chapter=1&verse=1-3
 * 1 Jean 1 -> /bible?book=1JN&chapter=1
 * 1 Jean -> /bible?book=1JN
 * Psaumes 23 -> /bible?book=PSA&chapter=23
 * Psaumes 23:1 -> /bible?book=PSA&chapter=23&verse=1
 * Psaumes 23:1-4 -> /bible?book=PSA&chapter=23&verse=1-4
 * Psaumes 23:1-4;1 -> /bible?book=PSA&chapter=23&verse=1-4;1
 * Psaumes 23:1-4;1 LSG -> /bible?book=PSA&chapter=23&verse=1-4;1&version=LSG
 * Psaumes 23:1 S21 -> /bible?book=PSA&chapter=23&verse=1-4;1&version=S21
 * @param ref
 */
export function verseParser(ref: string, toUrl: true): string;
export function verseParser(ref: string, toUrl?: false): VerseObject;
export function verseParser(ref: string, toUrl: boolean = false): VerseObject | string {
    const verseObject: VerseObject = {
        book: null,
        chapter: null as number | null,
        verse: null as string | null,
        version: null
    };
    let refTrimmed = ref.trim();

    // Si pas de données de livres, retourner la page bible par défaut
    if (!booksData?.length) return toUrl ? '/bible' : verseObject;

    // Extraire le nom du livre (peut inclure un numéro comme "1 Jean", "2 Pierre")
    const bookMatch = refTrimmed.match(/^(1|2|3)?\s?([^\d:]+)/);
    if (!bookMatch) return toUrl ? '/bible' : verseObject;

    const bookName = bookMatch[0].trim();

    // Trouver le livre correspondant dans la base de données
    const book = booksData.find((b: any) =>
        b.name.toLowerCase() === bookName.toLowerCase()
    );

    if (!book) return toUrl ? '/bible' : verseObject;

    // Retirer le nom du livre de la référence
    refTrimmed = refTrimmed.replace(bookMatch[0], '').trim();

    // Si pas de chapitre/verset spécifié, retourner juste le livre
    if (!refTrimmed) return toUrl ? `/bible?book=${book.code}` : { ...verseObject, book: book.code };
    // Extraire la version si elle est spécifiée à la fin (tout texte après les chiffres)
    const versionMatch = refTrimmed.match(/^(\d+(?::\d+(?:[-;,]\d+)*)?)\s+([A-Za-z0-9]+)$/);
    let version = '';
    if (versionMatch?.[2] && versionMatch?.[1]) {
        version = versionMatch[2].toUpperCase();
        refTrimmed = versionMatch[1]; // Garder seulement la partie chapitre:verset
    }

    // Extraire chapitre et versets (format: "chapitre:versets" ou juste "chapitre")
    const chapterVerseMatch = refTrimmed.match(/^(\d+)(?::([\d\-;,]+))?$/);
    if (!chapterVerseMatch) return toUrl ? `/bible?book=${book.code}` : { ...verseObject, book: book.code };

    verseObject.book = book.code;

    // Ajouter le chapitre
    if (chapterVerseMatch[1]) {
        verseObject.chapter = parseInt(chapterVerseMatch[1]);
    }

    // Ajouter les versets s'ils sont spécifiés
    if (chapterVerseMatch[2]) {
        verseObject.verse = chapterVerseMatch[2];
    }

    // Ajouter la version si spécifiée
    if (version) {
        verseObject.version = version;
    }

    return toUrl ? parseToUrl(verseObject) : verseObject;
};

export const parseToUrl = (verseObject: VerseObject): string => {
    const urlQuery = new URLSearchParams();
    if (verseObject.book) urlQuery.append('book', verseObject.book);
    if (verseObject.chapter) urlQuery.append('chapter', verseObject.chapter.toString());
    if (verseObject.verse) urlQuery.append('verse', verseObject.verse);
    if (verseObject.version) urlQuery.append('version', verseObject.version);
    return `/bible?${urlQuery.toString()}`;
};

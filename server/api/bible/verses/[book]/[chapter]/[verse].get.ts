import type { BibleBook, BibleVerse, BibleVersion } from '@prisma/client';
import { prisma } from '~~/lib/prisma';

export default defineEventHandler(async (event) => {
    try {
        const { book: bookParam, chapter } = getRouterParams(event);
        const query = getQuery(event);

        // Version par défaut si non précisée
        const versionCode = (query.version as string) || 'LSG';

        // Supporte soit le paramètre de chemin /:verse, soit la query ?verse=
        const verseParam = (query.verse as string) ?? (getRouterParams(event).verse as string);

        // Validation des paramètres requis
        if (!bookParam || !chapter) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Les paramètres book et chapter sont requis'
            });
        }

        if (!verseParam) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Le paramètre verse est requis (ex: 1, 1-3, 1-3;8;12-14)'
            });
        }

        const chapterNum = parseInt(chapter as string, 10);
        if (Number.isNaN(chapterNum) || chapterNum <= 0) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Le chapitre doit être un entier positif'
            });
        }

        // Normaliser le code du livre
        const bookCode = String(bookParam).toUpperCase();

        // Vérifier que le livre existe
        const bibleBook = await prisma.bibleBook.findUnique({
            where: { code: bookCode }
        });
        if (!bibleBook) {
            throw createError({
                statusCode: 404,
                statusMessage: `Livre biblique "${bookCode}" non trouvé`
            });
        }

        // Vérifier que la version existe
        const bibleVersion = await prisma.bibleVersion.findUnique({
            where: { code: versionCode }
        });
        if (!bibleVersion) {
            throw createError({
                statusCode: 404,
                statusMessage: `Version biblique "${versionCode}" non trouvée`
            });
        }

        // Parse du paramètre verse: ex "1", "1-3", "1-3;8;12-14" (on accepte aussi des virgules)
        const tokens = String(verseParam)
            .replace(/\s+/g, '')
            .split(/[;]/)
            .filter(Boolean);

        const verseSet = new Set<number>();
        for (const tok of tokens) {
            if (tok.includes('-')) {
                const [startStr, endStr] = tok.split('-');
                const start = parseInt(startStr || '', 10);
                const end = parseInt(endStr || '', 10);
                if (
                    Number.isNaN(start)
                    || Number.isNaN(end)
                    || start <= 0
                    || end <= 0
                    || end < start
                ) {
                    throw createError({
                        statusCode: 400,
                        statusMessage: `Plage de versets invalide: "${tok}"`
                    });
                }
                for (let v = start; v <= end; v++) verseSet.add(v);
            } else {
                const v = parseInt(tok, 10);
                if (Number.isNaN(v) || v <= 0) {
                    throw createError({
                        statusCode: 400,
                        statusMessage: `Numéro de verset invalide: "${tok}"`
                    });
                }
                verseSet.add(v);
            }
        }

        const verseNumbers = Array.from(verseSet).sort((a, b) => a - b);

        // Générer un résumé compressé des versets (ex: "1-3;5;7-9")
        const buildSummary = (nums: number[]) => {
            if (!nums.length) return '';
            const ranges: string[] = [];
            let start = nums[0];
            let prev = nums[0];
            for (let i = 1; i < nums.length; i++) {
                const n = nums[i];
                if (prev !== undefined && n === prev + 1) {
                    prev = n;
                    continue;
                }
                ranges.push(start === prev ? String(start) : `${start}-${prev}`);
                start = prev = n;
            }
            ranges.push(start === prev ? String(start) : `${start}-${prev}`);
            return ranges.join(';');
        };
        const summary = `${bibleBook.name} ${chapterNum}:${buildSummary(verseNumbers)} - ${bibleVersion.code}`;

        // Récupérer les versets correspondants
        const bibleVerses = await prisma.bibleVerse.findMany({
            where: {
                bookId: bibleBook.id,
                versionId: bibleVersion.id,
                chapter: chapterNum,
                verse: { in: verseNumbers }
            },
            include: {
                book: true,
                version: true
            },
            orderBy: { verse: 'asc' }
        }) as (BibleVerse & { book: BibleBook; version: BibleVersion; })[];

        if (!bibleVerses.length) {
            throw createError({
                statusCode: 404,
                statusMessage: `Aucun verset trouvé pour ${bookCode} ${chapter}:${verseParam} dans la version ${versionCode}`
            });
        }

        return {
            success: true,
            data: bibleVerses as (BibleVerse & { book: BibleBook; version: BibleVersion; })[],
            count: bibleVerses.length,
            meta: {
                requested: verseParam,
                normalized: verseNumbers,
                summary,
                book: bookCode,
                chapter: chapterNum,
                version: bibleVersion.code
            }
        };
    } catch (error: any) {
        if (error.statusCode) throw error;
        console.error('Erreur lors de la récupération du/des verset(s):', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur interne du serveur lors de la récupération des versets'
        });
    }
});

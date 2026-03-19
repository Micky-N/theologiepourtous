import { readFile } from 'node:fs/promises';

type BibleVersionRecord = {
    code: string;
    name: string;
    language: string;
    year: number | null;
    isActive: boolean;
    orderIndex: number;
};

export default defineEventHandler(async () => {
    try {
        const fileContent = await readFile(new URL('../../data/versions.json', import.meta.url), 'utf-8');
        const versions = (JSON.parse(fileContent) as BibleVersionRecord[])
            .filter(version => version.isActive)
            .sort((left, right) => left.orderIndex - right.orderIndex)
            .map(version => ({
                id: version.orderIndex,
                code: version.code,
                name: version.name,
                language: version.language,
                year: version.year
            }));

        return {
            success: true,
            data: versions,
            count: versions.length
        };
    } catch {
        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur lors de la récupération des versions bibliques'
        });
    }
});

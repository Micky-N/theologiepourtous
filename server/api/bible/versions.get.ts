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
        const versions = (await getBibleVersions())
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
            message: 'Erreur lors de la récupération des versions bibliques'
        });
    }
});

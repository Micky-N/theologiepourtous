import { prisma } from '~~/lib/prisma';

export default defineEventHandler(async () => {
    try {
        const versions = await prisma.bibleVersion.findMany({
            where: {
                isActive: true
            },
            orderBy: {
                orderIndex: 'asc'
            },
            select: {
                id: true,
                code: true,
                name: true,
                language: true,
                year: true
            }
        });

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

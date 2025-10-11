import { BibleVersion } from '~~/src/database/models/BibleVersion';

export default defineEventHandler(async () => {
    try {
        const versions = await BibleVersion.findAll({
            where: { isActive: true },
            order: [['orderIndex', 'ASC']],
            attributes: ['id', 'code', 'name', 'language', 'year']
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

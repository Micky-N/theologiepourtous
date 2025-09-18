import { PrismaClient } from '~/generated/prisma'

const prisma = new PrismaClient()

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
                description: true,
                year: true
            }
        })

        return {
            success: true,
            data: versions,
            count: versions.length
        }
    } catch {
        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur lors de la récupération des versions bibliques'
        })
    }
})

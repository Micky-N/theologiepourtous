import { PrismaClient } from '@prisma/client'
import { requireAuth } from '../../../server/utils/auth'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    if (event.node.req.method !== 'GET') {
        throw createError({
            statusCode: 405,
            statusMessage: 'Method Not Allowed'
        })
    }

    try {
        // Vérifier l'authentification
        const userId = await requireAuth(event)

        // Récupérer les informations de l'utilisateur
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                lastLogin: true
            }
        })

        if (!user) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Utilisateur non trouvé'
            })
        }

        return {
            success: true,
            user
        }
    } catch (error: any) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error)

        if (error.statusCode) {
            throw error
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur interne du serveur'
        })
    } finally {
        await prisma.$disconnect()
    }
})

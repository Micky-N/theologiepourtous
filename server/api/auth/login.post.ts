import { prisma } from '~~/lib/prisma'
import { verifyPassword, generateJWT, isValidEmail } from '~~/server/utils/auth'
import { z } from 'zod'

// Schéma de validation pour la connexion
const loginSchema = z.object({
    email: z.string().email('Format d\'email invalide'),
    password: z.string().min(1, 'Le mot de passe est requis')
})

export default defineEventHandler(async (event) => {
    if (event.node.req.method !== 'POST') {
        throw createError({
            statusCode: 405,
            statusMessage: 'Method Not Allowed'
        })
    }

    try {
        const body = await readBody(event)

        // Validation des données
        const validation = loginSchema.safeParse(body)
        if (!validation.success) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Données invalides',
                data: validation.error.issues
            })
        }

        const { email, password } = validation.data

        // Validation supplémentaire de l'email
        if (!isValidEmail(email)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Format d\'email invalide'
            })
        }

        // Trouver l'utilisateur
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Email ou mot de passe incorrect'
            })
        }

        // Vérifier le mot de passe
        const isPasswordValid = await verifyPassword(password, user.password)
        if (!isPasswordValid) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Email ou mot de passe incorrect'
            })
        }

        // Générer un token JWT
        const token = generateJWT(user.id, user.email)

        // Définir le cookie sécurisé
        setCookie(event, 'auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
        })

        // Mettre à jour la date de dernière connexion
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        })

        return {
            success: true,
            message: 'Connexion réussie',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            }
        }
    } catch (error: any) {
        console.error('Erreur lors de la connexion:', error)

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

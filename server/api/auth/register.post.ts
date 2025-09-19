import { prisma } from '~~/lib/prisma'
import { hashPassword, generateJWT, isValidEmail, isValidPassword } from '../../../server/utils/auth'
import { z } from 'zod'

// Schéma de validation pour l'inscription
const registerSchema = z.object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(50, 'Le nom ne doit pas dépasser 50 caractères'),
    email: z.string().email('Format d\'email invalide'),
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères')
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
        const validation = registerSchema.safeParse(body)
        if (!validation.success) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Données invalides',
                data: validation.error.issues
            })
        }

        const { name, email, password } = validation.data

        // Validation supplémentaire de l'email
        if (!isValidEmail(email)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Format d\'email invalide'
            })
        }

        // Validation de la force du mot de passe
        const passwordValidation = isValidPassword(password)
        if (!passwordValidation.valid) {
            throw createError({
                statusCode: 400,
                statusMessage: passwordValidation.message
            })
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            throw createError({
                statusCode: 409,
                statusMessage: 'Un utilisateur avec cet email existe déjà'
            })
        }

        // Hasher le mot de passe
        const hashedPassword = await hashPassword(password)

        // Créer l'utilisateur
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'USER'
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true
            }
        })

        // Générer un token JWT
        const token = generateJWT(user.id, user.email)

        // Définir le cookie sécurisé
        setCookie(event, 'auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
        })

        return {
            success: true,
            message: 'Inscription réussie',
            user
        }
    } catch (error: any) {
        console.error('Erreur lors de l\'inscription:', error)

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

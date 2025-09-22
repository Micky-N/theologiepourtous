import { prisma } from '~~/lib/prisma';
import { z } from 'zod';

// Schéma de validation pour l'inscription
const registerSchema = z.object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(50, 'Le nom ne doit pas dépasser 50 caractères'),
    email: z.string().email('Format d\'email invalide'),
    password: z.string()
        .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
        .regex(/(?=.*[a-z])/, 'Le mot de passe doit contenir au moins une minuscule')
        .regex(/(?=.*[A-Z])/, 'Le mot de passe doit contenir au moins une majuscule')
        .regex(/(?=.*\d)/, 'Le mot de passe doit contenir au moins un chiffre')
});

export default defineEventHandler(async (event) => {
    if (event.node.req.method !== 'POST') {
        throw createError({
            statusCode: 405,
            statusMessage: 'Method Not Allowed'
        });
    }

    try {
        // Is user already logged in?
        const { user: userSession } = await getUserSession(event);
        if (userSession) {
            return {
                success: true,
                message: 'Utilisateur déjà connecté',
                user: userSession
            };
        }

        const { name, email, password } = await readValidatedBody(event, registerSchema.parse);

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            throw createError({
                statusCode: 409,
                statusMessage: 'Un utilisateur avec cet email existe déjà'
            });
        }

        // Hasher le mot de passe
        const hashedPassword = await hashPassword(password);

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
        });

        await setUserSession(event, {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

        return {
            success: true,
            message: 'Inscription réussie',
            user
        };
    } catch (error: any) {
        console.error('Erreur lors de l\'inscription:', error);

        if (error.statusCode) {
            throw error;
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur interne du serveur'
        });
    } finally {
        await prisma.$disconnect();
    }
});

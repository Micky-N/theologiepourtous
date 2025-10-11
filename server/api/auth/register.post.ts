import { z } from 'zod';
import { User } from '~~/src/database/models/User';
import { UserPreference } from '~~/src/database/models/UserPreference';

// Schéma de validation pour l'inscription
const registerSchema = z.object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(50, 'Le nom ne doit pas dépasser 50 caractères'),
    email: z.string().email('Format d\'email invalide'),
    password: z.string()
        .min(7, 'Le mot de passe doit contenir au moins 7 caractères')
        .regex(/(?=.*[a-z])/, 'Le mot de passe doit contenir au moins une minuscule')
        .regex(/(?=.*[A-Z])/, 'Le mot de passe doit contenir au moins une majuscule')
        .regex(/(?=.*\d)/, 'Le mot de passe doit contenir au moins un chiffre'),
    confirmPassword: z.string().min(7)
}).refine(data => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword']
});

export default defineEventHandler(async (event) => {
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
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            throw createError({
                statusCode: 409,
                statusMessage: 'Un utilisateur avec cet email existe déjà'
            });
        }

        // Hasher le mot de passe
        const hashedPassword = await hashPassword(password);

        // Créer l'utilisateur
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'USER'
        });

        // Créer les préférences utilisateur par défaut
        await UserPreference.create({
            userId: user.id,
            defaultVersionId: null,
            notesPerVersion: false,
            bookmarksPerVersion: false
        });

        await setUserSession(event, {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                preferences: {
                    defaultVersionId: null,
                    notesPerVersion: false,
                    bookmarksPerVersion: false,
                    defaultVersion: null
                }
            }
        });

        return {
            success: true,
            message: 'Inscription réussie',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            }
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
    }
});

import { User } from '~~/src/database/models/User';
import { z } from 'zod';
import { UserPreference } from '~~/src/database/models/UserPreference';

// Schéma de validation pour la connexion
const loginSchema = z.object({
    email: z.string().email('Format d\'email invalide'),
    password: z.string().min(1, 'Le mot de passe est requis')
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

        const { email, password } = await readValidatedBody(event, loginSchema.parse);

        // Trouver l'utilisateur
        const user = await User.findOne({
            where: { email },
            include: UserPreference
        });

        if (!user) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Email ou mot de passe incorrect'
            });
        }

        // Vérifier le mot de passe
        const isPasswordValid = await verifyPassword(user.password, password);
        if (!isPasswordValid) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Email ou mot de passe incorrect'
            });
        }

        const preferences = user.userPreference;

        await setUserSession(event, {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                preferences
            }
        });

        // Mettre à jour la date de dernière connexion
        user.lastLogin = new Date();
        await user.save();

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
        };
    } catch (error: any) {
        console.error('Erreur lors de la connexion:', error);

        if (error.statusCode) {
            throw error;
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur interne du serveur'
        });
    }
});

import z from 'zod';
import { User } from '~~/src/database/models/User';

const profileSchema = z.object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z.string().email('Adresse mail invalide'),
    currentPassword: z.string().min(7).nullable(),
    newPassword: z.string().min(7, 'Le mot de passe doit contenir au moins 7 caractères')
        .regex(/(?=.*[a-z])/, 'Le mot de passe doit contenir au moins une minuscule')
        .regex(/(?=.*[A-Z])/, 'Le mot de passe doit contenir au moins une majuscule')
        .regex(/(?=.*\d)/, 'Le mot de passe doit contenir au moins un chiffre')
        .nullable(),
    confirmPassword: z.string().min(7).nullable()
}).refine(data => !data.newPassword || data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword']
});

export default defineEventHandler(async (event) => {
    try {
        // Vérifier l'authentification
        const { user: userSession } = await getUserSession(event);

        if (!userSession) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Non autorisé'
            });
        }

        const { name, email, newPassword } = await readValidatedBody(event, profileSchema.parse);

        let hashedPassword: string | null = null;
        if (newPassword) hashedPassword = await hashPassword(newPassword);

        // Vérifier que le user existe si fournie
        const user = await User.findByPk(userSession.id);
        if (!user) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Utilisateur non trouvé'
            });
        }
        await user.update({
            name,
            email,
            ...(hashedPassword && { password: hashedPassword })
        });

        await replaceUserSession(event, {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

        return {
            success: true,
            message: 'Utilisateur mis à jour avec succès'
        };
    } catch (error: any) {
        if (error.statusCode) {
            throw error;
        }
        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur lors de la mise à jour de l\'utilisateur'
        });
    }
});

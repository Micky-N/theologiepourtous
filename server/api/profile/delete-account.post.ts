import { User } from '~~/src/database/models/User';
import { BibleBookmark } from '~~/src/database/models/BibleBookmark';
import { BibleNote } from '~~/src/database/models/BibleNote';
import { ReadingSession } from '~~/src/database/models/ReadingSession';
import { UserProgress } from '~~/src/database/models/UserProgress';
import { UserPreference } from '~~/src/database/models/UserPreference';
import { z } from 'zod';

// Schéma de validation pour la suppression de compte
const deleteAccountSchema = z.object({
    password: z.string().min(1, 'Le mot de passe est requis')
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

        const { password } = await readValidatedBody(event, deleteAccountSchema.parse);

        // Récupérer l'utilisateur complet avec le mot de passe
        const user = await User.findByPk(userSession.id);

        if (!user) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Utilisateur non trouvé'
            });
        }

        // Vérifier le mot de passe
        const isPasswordValid = await verifyPassword(user.password, password);
        if (!isPasswordValid) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Mot de passe incorrect'
            });
        }

        // Supprimer toutes les données liées à l'utilisateur
        await BibleBookmark.destroy({ where: { userId: user.id } });
        await BibleNote.destroy({ where: { userId: user.id } });
        await ReadingSession.destroy({ where: { userId: user.id } });
        await UserProgress.destroy({ where: { userId: user.id } });
        await UserPreference.destroy({ where: { userId: user.id } });
        await user.destroy();

        // Déconnecter l'utilisateur en vidant la session
        await clearUserSession(event);

        return {
            success: true,
            message: 'Compte supprimé avec succès'
        };
    } catch (error: any) {
        console.error('Erreur lors de la suppression du compte:', error);

        if (error.statusCode) {
            throw error;
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur interne du serveur lors de la suppression du compte'
        });
    }
});

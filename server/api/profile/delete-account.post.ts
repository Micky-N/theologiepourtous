import { prisma } from '~~/lib/prisma';
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
        const user = await prisma.user.findUnique({
            where: { id: userSession.id }
        });

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
        await prisma.$transaction(async (tx) => {
            // Supprimer les signets
            await tx.bibleBookmark.deleteMany({
                where: { userId: user.id }
            });

            // Supprimer les notes
            await tx.bibleNote.deleteMany({
                where: { userId: user.id }
            });

            // Supprimer les sessions de lecture
            await tx.readingSession.deleteMany({
                where: { userId: user.id }
            });

            // Supprimer les progrès utilisateur
            await tx.userProgress.deleteMany({
                where: { userId: user.id }
            });

            // Supprimer les préférences utilisateur
            await tx.userPreference.delete({
                where: { userId: user.id }
            }).catch(() => {
                // Ignore si pas de préférences
            });

            // Enfin, supprimer l'utilisateur
            await tx.user.delete({
                where: { id: user.id }
            });
        });

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

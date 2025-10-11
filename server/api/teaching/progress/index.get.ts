import { UserProgress } from '~~/src/database/models/UserProgress';
import { createError } from 'h3';

export default defineEventHandler<Promise<{ success: boolean; data: UserProgress[]; }>>(async (event) => {
    // Get authenticated user
    const { user } = await getUserSession(event);
    if (!user) {
        throw createError({
            statusCode: 401,
            message: 'Vous devez être connecté pour accéder à cette ressource'
        });
    }

    // Find user progress for the theme
    const progress = await UserProgress.findAll({
        where: {
            userId: user.id
        }
    });

    return {
        success: true,
        data: progress
    };
});

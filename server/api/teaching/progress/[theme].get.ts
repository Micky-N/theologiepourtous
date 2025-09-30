import { prisma } from '~~/lib/prisma';
import { createError } from 'h3';
import type { UserProgress } from '@prisma/client';

export default defineEventHandler<Promise<{ success: boolean; data: UserProgress | null; }>>(async (event) => {
    // Get authenticated user
    const { user } = await getUserSession(event);
    if (!user) {
        throw createError({
            statusCode: 401,
            message: 'Vous devez être connecté pour accéder à cette ressource'
        });
    }

    const theme = getRouterParam(event, 'theme');

    // Find user progress for the theme
    const progress = await prisma.userProgress.findFirst({
        where: {
            userId: user.id,
            theme
        }
    });

    return {
        success: true,
        data: progress
    };
});

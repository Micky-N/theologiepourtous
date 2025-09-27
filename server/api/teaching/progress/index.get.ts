import { prisma } from '~~/lib/prisma';
import { createError } from 'h3';
import type { UserProgress } from '@prisma/client';

export default defineEventHandler<Promise<{ success: boolean, data: UserProgress[] }>>(async (event) => {
    // Get authenticated user
    const { user } = await getUserSession(event);
    if (!user) {
        throw createError({
            statusCode: 401,
            message: 'Vous devez être connecté pour accéder à cette ressource'
        });
    }

    // Find user progress for the theme
    const progress = await prisma.userProgress.findMany({
        where: {
            userId: user.id
        }
    });

    return {
        success: true,
        data: progress
    };
});

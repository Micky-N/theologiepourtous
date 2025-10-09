import { UserProgress } from '~~/src/database/models/UserProgress';
import { createError } from 'h3';

export default defineEventHandler<Promise<{ success: boolean; data: UserProgress; }>>(async (event) => {
    // Get authenticated user
    const { user } = await getUserSession(event);
    if (!user) {
        throw createError({
            statusCode: 401,
            message: 'Vous devez être connecté pour accéder à cette ressource'
        });
    }

    const theme = getRouterParam(event, 'theme');
    if (!theme) {
        throw createError({
            statusCode: 400,
            message: 'Le thème est requis'
        });
    }

    const body = await readBody<{ lesson: string; } | null>(event);

    // Find existing progress
    let progress = await UserProgress.findOne({
        where: {
            userId: user.id,
            theme
        }
    });

    // If no progress exists, create a new one
    if (!progress) {
        progress = await UserProgress.create({
            userId: user.id,
            theme,
            startedAt: new Date(),
            lessons: '[]'
        });
    }

    // If a lesson is provided in the body, add it to the lessons array
    if (body?.lesson) {
        const lessons = JSON.parse(progress.lessons || '[]') as string[];
        if (!lessons.includes(body.lesson)) {
            lessons.push(body.lesson);
        } else {
            // Remove the lesson from the lessons array
            const index = lessons.indexOf(body.lesson);
            if (index !== -1) {
                lessons.splice(index, 1);
            }
        }
        await progress.update({ lessons: JSON.stringify(lessons) });
    }

    return {
        success: true,
        data: progress
    };
});

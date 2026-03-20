import type { LessonsCollectionItem } from '@nuxt/content';
import type { AuthenticatedUserData, UserProgress } from '~/types';

type BackendLesson = {
    id: string;
    slug: string;
    theme: string;
    path: string;
    created_at: string;
    updated_at: string;
};

type BackendLessonProgressEntry = {
    id: string;
    user_id: string;
    lesson_id: string | number;
    lesson: BackendLesson;
    created_at: string;
    updated_at: string;
};

type LessonMetadata = {
    numericId: number;
    slug: string;
    theme: string;
    sourceId: string | null;
    path: string;
    sortKey: string;
};

const sortLessons = (lessons: LessonsCollectionItem[]) => {
    return [...lessons].sort((left, right) => {
        const leftKey = String(left.id || left.path || `${left.theme}/${left.slug}`);
        const rightKey = String(right.id || right.path || `${right.theme}/${right.slug}`);
        return leftKey.localeCompare(rightKey);
    });
};

export const useTeachingProgress = () => {
    const client = useSanctumClient();
    const user = useSanctumUser<AuthenticatedUserData>();
    const lessonMetadata = useState<LessonMetadata[] | null>('teaching-lesson-metadata', () => null);

    const getLessonMetadata = async () => {
        if (lessonMetadata.value) {
            return lessonMetadata.value;
        }

        const lessons = sortLessons(await queryCollection('lessons').all());
        lessonMetadata.value = lessons.map((lesson, index) => ({
            numericId: index + 1,
            slug: lesson.slug,
            theme: lesson.theme,
            sourceId: typeof lesson.id === 'string' ? lesson.id : null,
            path: lesson.path,
            sortKey: String(lesson.id || lesson.path || `${lesson.theme}/${lesson.slug}`)
        }));

        return lessonMetadata.value;
    };

    const findLessonByThemeAndSlug = async (theme: string, slug: string) => {
        const lessons = await getLessonMetadata();
        return lessons.find(lesson => lesson.theme === theme && lesson.slug === slug) ?? null;
    };

    const buildThemeProgress = async (
        theme: string,
        entries: BackendLessonProgressEntry[],
        options?: { includeSynthetic?: boolean; userId?: string; }
    ): Promise<UserProgress | null> => {
        const lessons = entries.flatMap(entry => entry.lesson.theme === theme ? entry.lesson : []);

        if (!lessons.length) {
            if (!options?.includeSynthetic) {
                return null;
            }

            return {
                userId: options?.userId ?? user.value?.id ?? '',
                theme,
                lessons: '[]',
                startedAt: null
            };
        }

        const sortedEntries = lessons.sort((left, right) => new Date(left.created_at).getTime() - new Date(right.created_at).getTime());
        const firstEntry = sortedEntries[0]!;

        return {
            userId: options?.userId ?? user.value?.id ?? '',
            theme,
            lessons: JSON.stringify(sortedEntries.map(item => item.slug)),
            startedAt: firstEntry.created_at
        };
    };

    const buildAllThemeProgress = async (entries: BackendLessonProgressEntry[]) => {
        const lessons = await getLessonMetadata();
        const themes = [...new Set(lessons.map(lesson => lesson.theme))];
        const progress = await Promise.all(themes.map(theme => buildThemeProgress(theme, entries)));
        return progress.filter((item): item is NonNullable<typeof item> => item !== null);
    };

    const fetchEntries = async () => {
        const response = await client<BackendLessonProgressEntry[]>('/lesson-progress-entries', {
            method: 'GET'
        });

        return response;
    };

    const fetchAllProgress = async () => {
        const entries = await fetchEntries();
        return await buildAllThemeProgress(entries);
    };

    const fetchThemeProgress = async (theme: string) => {
        const entries = await fetchEntries();
        return await buildThemeProgress(theme, entries, {
            includeSynthetic: true,
            userId: user.value?.id
        });
    };

    const trackThemeProgress = async (theme: string, lessonSlug?: string) => {
        let entries = await fetchEntries();

        if (lessonSlug) {
            const lesson = await findLessonByThemeAndSlug(theme, lessonSlug);

            if (!lesson) {
                throw createError({
                    statusCode: 404,
                    message: 'Leçon introuvable'
                });
            }

            const alreadyTracked = entries.some(entry => entry.lesson.slug === lesson.slug);

            if (!alreadyTracked) {
                await client('/lesson-progress-entries', {
                    method: 'POST',
                    body: {
                        lesson_slug: lesson.slug
                    }
                });

                entries = await fetchEntries();
            }
        }

        return await buildThemeProgress(theme, entries, {
            includeSynthetic: true,
            userId: user.value?.id
        });
    };

    return {
        getLessonMetadata,
        fetchAllProgress,
        fetchThemeProgress,
        trackThemeProgress
    };
};

import type { LessonsCollectionItem } from '@nuxt/content';
import type { AuthenticatedUserData, UserProgress } from '~/types';

type BackendLessonProgressEntry = {
    id: string;
    user_id: string;
    lesson_id: string | number;
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

    const findLessonByApiId = async (lessonId: string | number) => {
        const normalized = String(lessonId);
        const lessons = await getLessonMetadata();
        const numericId = Number.parseInt(normalized, 10);

        if (Number.isInteger(numericId)) {
            const byNumericId = lessons.find(lesson => lesson.numericId === numericId);
            if (byNumericId) {
                return byNumericId;
            }
        }

        return lessons.find(lesson => lesson.sourceId === normalized || lesson.slug === normalized) ?? null;
    };

    const buildThemeProgress = async (
        theme: string,
        entries: BackendLessonProgressEntry[],
        options?: { includeSynthetic?: boolean; userId?: string; }
    ): Promise<UserProgress | null> => {
        const resolvedEntries = await Promise.all(entries.map(async (entry) => {
            const lesson = await findLessonByApiId(entry.lesson_id);
            if (!lesson || lesson.theme !== theme) {
                return null;
            }

            return { entry, lesson };
        }));

        const matchingEntries = resolvedEntries.filter((item): item is NonNullable<typeof item> => item !== null);

        if (!matchingEntries.length) {
            if (!options?.includeSynthetic) {
                return null;
            }

            const now = new Date().toISOString();
            return {
                id: `theme:${theme}`,
                userId: options?.userId ?? user.value?.id ?? '',
                theme,
                lessons: '[]',
                startedAt: null,
                createdAt: now,
                updatedAt: now
            };
        }

        const sortedEntries = matchingEntries.sort((left, right) => left.lesson.numericId - right.lesson.numericId);
        const firstEntry = sortedEntries[0]!;
        const lastEntry = sortedEntries[sortedEntries.length - 1]!;

        return {
            id: `theme:${theme}`,
            userId: firstEntry.entry.user_id,
            theme,
            lessons: JSON.stringify(sortedEntries.map(item => item.lesson.slug)),
            startedAt: firstEntry.entry.created_at,
            createdAt: firstEntry.entry.created_at,
            updatedAt: lastEntry.entry.updated_at
        };
    };

    const buildAllThemeProgress = async (entries: BackendLessonProgressEntry[]) => {
        const lessons = await getLessonMetadata();
        const themes = [...new Set(lessons.map(lesson => lesson.theme))];
        const progress = await Promise.all(themes.map(theme => buildThemeProgress(theme, entries)));
        return progress.filter((item): item is NonNullable<typeof item> => item !== null);
    };

    const fetchEntries = async () => {
        const response = await client<{ data: BackendLessonProgressEntry[]; }>('/lesson-progress-entries', {
            method: 'GET'
        });

        return response.data;
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

            const alreadyTracked = entries.some(entry => String(entry.lesson_id) === String(lesson.numericId));

            if (!alreadyTracked) {
                await client('/lesson-progress-entries', {
                    method: 'POST',
                    body: {
                        lesson_id: lesson.numericId
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

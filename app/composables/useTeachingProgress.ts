import { useTeachingsApi } from '~/composables/useTeachingsApi';
import type { AuthenticatedUserData, BackendLessonProgressEntry, LessonMetadata, TeachingLessonData, UserProgress } from '~/types';

export const useTeachingProgress = () => {
    const client = useSanctumClient();
    const user = useSanctumUser<AuthenticatedUserData>();
    const { fetchLessons } = useTeachingsApi();
    const lessonMetadata = useState<LessonMetadata[] | null>('teaching-lesson-metadata', () => null);

    const getLessonMetadata = async (): Promise<LessonMetadata[]> => {
        if (lessonMetadata.value) {
            return lessonMetadata.value;
        }

        const lessons = await fetchLessons();
        lessonMetadata.value = lessons.map((lesson: TeachingLessonData) => ({
            slug: lesson.slug,
            theme_slug: lesson.theme?.slug ?? '',
            path: lesson.path,
            sortKey: String(lesson.id || lesson.path || `${lesson.theme?.slug}/${lesson.slug}`)
        }));

        return lessonMetadata.value ?? [];
    };

    const findLessonByThemeAndSlug = async (themeSlug: string, slug: string) => {
        const lessons = await getLessonMetadata();
        return lessons.find(lesson => lesson.theme_slug === themeSlug && lesson.slug === slug) ?? null;
    };

    const buildThemeProgress = async (
        themeSlug: string,
        entries: BackendLessonProgressEntry[],
        options?: { includeSynthetic?: boolean; userId?: string; }
    ): Promise<UserProgress | null> => {
        const themeEntries = entries
            .filter(entry => entry.lesson?.theme_slug === themeSlug)
            .sort((left, right) => new Date(left.created_at).getTime() - new Date(right.created_at).getTime());

        if (!themeEntries.length) {
            if (!options?.includeSynthetic) {
                return null;
            }

            return {
                user_id: options?.userId ?? user.value?.id ?? '',
                theme_slug: themeSlug,
                lessons: [],
                started_at: null
            };
        }

        const firstEntry = themeEntries[0]!;

        return {
            user_id: options?.userId ?? user.value?.id ?? '',
            theme_slug: themeSlug,
            lessons: themeEntries.map(entry => entry.lesson),
            started_at: firstEntry.created_at
        };
    };

    const buildAllThemeProgress = async (entries: BackendLessonProgressEntry[]) => {
        const lessons = await getLessonMetadata();
        const themes = [...new Set(lessons.map(lesson => lesson.theme_slug))];
        const progress = await Promise.all(themes.map(themeSlug => buildThemeProgress(themeSlug, entries)));
        return progress.filter((item): item is NonNullable<typeof item> => item !== null);
    };

    const fetchEntries = async () => {
        const response = await client<BackendLessonProgressEntry[]>('/lesson-progress-entries', {
            method: 'GET'
        });

        return response.filter(entry => entry.lesson !== null);
    };

    const fetchAllProgress = async () => {
        const entries = await fetchEntries();
        return await buildAllThemeProgress(entries);
    };

    const fetchThemeProgress = async (themeSlug: string) => {
        const entries = await fetchEntries();
        return await buildThemeProgress(themeSlug, entries, {
            includeSynthetic: true,
            userId: user.value?.id
        });
    };

    const trackThemeProgress = async (themeSlug: string, lessonSlug?: string) => {
        let entries = await fetchEntries();

        if (lessonSlug) {
            const lesson = await findLessonByThemeAndSlug(themeSlug, lessonSlug);

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

        return await buildThemeProgress(themeSlug, entries, {
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

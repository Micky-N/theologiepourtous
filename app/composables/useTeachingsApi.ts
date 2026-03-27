import type {
    TeachingLessonData,
    TeachingLessonPageData,
    TeachingSeoData,
    TeachingThemeData
} from '~/types';

type TeachingThemePayload = Omit<TeachingThemeData, 'image_url' | 'lessons' | 'seo'> & {
    image_url: string | null;
    lessons?: TeachingLessonPayload[];
    seo?: Partial<TeachingSeoData> | null;
};

type TeachingLessonPayload = Omit<TeachingLessonData, 'image_url' | 'theme' | 'seo'> & {
    image_url: string | null;
    theme: TeachingThemePayload;
    seo?: Partial<TeachingSeoData> | null;
};

export const useTeachingsApi = () => {
    const client = useSanctumClient();

    const normalizeSeo = (seo: Partial<TeachingSeoData> | null | undefined, fallback: { title: string; description: string | null; }) => ({
        title: seo?.title ?? fallback.title,
        description: seo?.description ?? fallback.description,
        keywords: Array.isArray(seo?.keywords) ? seo.keywords.filter(Boolean) : [],
        lang: seo?.lang ?? 'fr'
    });

    const normalizeThemeBase = (theme: TeachingThemePayload): TeachingThemeData => ({
        id: theme.id,
        path: theme.path || `/enseignements/${theme.slug}`,
        title: theme.title,
        slug: theme.slug,
        position: theme.position ?? null,
        excerpt: theme.excerpt ?? null,
        color: theme.color ?? 'primary',
        image_url: theme.image_url,
        lessons_count: theme.lessons_count,
        lessons: [],
        created_at: theme.created_at ?? null,
        updated_at: theme.updated_at ?? null,
        seo: normalizeSeo(theme.seo, {
            title: theme.title,
            description: theme.excerpt ?? null
        })
    });

    const normalizeLesson = (lesson: TeachingLessonPayload): TeachingLessonData => ({
        id: lesson.id,
        theme_id: lesson.theme_id ?? null,
        theme: normalizeThemeBase(lesson.theme),
        path: lesson.path,
        title: lesson.title,
        slug: lesson.slug,
        position: lesson.position ?? null,
        excerpt: lesson.excerpt ?? null,
        tags: Array.isArray(lesson.tags) ? lesson.tags : [],
        reading_time: lesson.reading_time ?? null,
        image_url: lesson.image_url,
        biblical_references: Array.isArray(lesson.biblical_references) ? lesson.biblical_references : [],
        content: lesson.content ?? null,
        published_at: lesson.published_at ?? null,
        created_at: lesson.created_at ?? null,
        updated_at: lesson.updated_at ?? null,
        seo: normalizeSeo(lesson.seo, {
            title: lesson.title,
            description: lesson.seo?.description ?? lesson.excerpt ?? null
        })
    });

    const normalizeTheme = (theme: TeachingThemePayload): TeachingThemeData => {
        const normalizedTheme = normalizeThemeBase(theme);
        const lessons = theme.lessons?.map(normalizeLesson) ?? [];

        return {
            ...normalizedTheme,
            lessons,
            lessons_count: normalizedTheme.lessons_count
        };
    };

    const fetchCollection = async <T>(path: string) => {
        const response = await client<T[]>(path);
        return response;
    };

    const fetchResource = async <T>(path: string) => {
        const response = await client<T>(path);
        return response;
    };

    const fetchThemes = async () => {
        const themes = await fetchCollection<TeachingThemePayload>('/themes');
        return themes.map(normalizeTheme);
    };

    const fetchTheme = async (slug: string) => {
        const theme = await fetchResource<TeachingThemePayload>(`/themes/${encodeURIComponent(slug)}`);
        return normalizeTheme(theme);
    };

    const fetchLessons = async () => {
        const lessons = await fetchCollection<TeachingLessonPayload>('/lessons');
        return lessons.map(normalizeLesson);
    };

    const fetchLesson = async (themeSlug: string, lessonSlug: string, includeNeighbors: boolean = false): Promise<TeachingLessonPageData> => {
        const payload = await fetchResource<TeachingLessonPageData>(`/themes/${encodeURIComponent(themeSlug)}/${encodeURIComponent(lessonSlug)}?include_neighbors=${includeNeighbors}`);

        return {
            current_lesson: normalizeLesson(payload.current_lesson as unknown as TeachingLessonPayload),
            previous_lesson: payload.previous_lesson ? normalizeLesson(payload.previous_lesson as unknown as TeachingLessonPayload) : null,
            next_lesson: payload.next_lesson ? normalizeLesson(payload.next_lesson as unknown as TeachingLessonPayload) : null
        };
    };

    return {
        fetchThemes,
        fetchTheme,
        fetchLessons,
        fetchLesson
    };
};

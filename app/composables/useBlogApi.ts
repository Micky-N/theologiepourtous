import type {
    BlogArticleData,
    BlogArticlePageData,
    BlogAuthorData,
    BlogCategoryData,
    BlogSeoData,
    BlogTagData,
    BlogTermData,
    BlogTermSummaryData
} from '~/types';

type BlogTermPayload = Partial<BlogTermData> & {
    id?: string | null;
    path?: string;
    title?: string | null;
    slug?: string | null;
    taxonomy?: string | null;
    articles_count?: number | null;
};

type BlogAuthorLinkPayload = {
    label?: string | null;
    url?: string | null;
};

type BlogAuthorPayload = Partial<BlogAuthorData> & {
    name?: string | null;
    role?: string | null;
    photo?: string | null;
    links?: BlogAuthorLinkPayload[] | null;
};

type BlogArticlePayload = Omit<Partial<BlogArticleData>, 'category' | 'tags' | 'author' | 'seo'> & {
    category?: BlogTermPayload | null;
    tags?: BlogTermPayload[] | null;
    author?: BlogAuthorPayload | null;
    seo?: Partial<BlogSeoData> | null;
};

type BlogCategoryPayload = BlogTermPayload & {
    articles?: BlogArticlePayload[] | null;
};

type BlogTagPayload = BlogTermPayload & {
    articles?: BlogArticlePayload[] | null;
};

type BlogArticlePagePayload = {
    current_article: BlogArticlePayload;
    previous_article: BlogArticlePayload | null;
    next_article: BlogArticlePayload | null;
};

export const useBlogApi = () => {
    const client = useSanctumClient();

    const normalizeSeo = (seo: Partial<BlogSeoData> | null | undefined, fallback: { title: string; description: string | null; }): BlogSeoData => ({
        title: seo?.title ?? fallback.title,
        description: seo?.description ?? fallback.description,
        keywords: Array.isArray(seo?.keywords) ? seo.keywords.filter(Boolean) : [],
        lang: seo?.lang ?? 'fr'
    });

    const inferTermPath = (term: BlogTermPayload): string | null => {
        if (term.path) {
            return term.path;
        }

        if (!term.slug) {
            return null;
        }

        if (term.taxonomy === 'categories') {
            return `/blog/${term.slug}`;
        }

        if (term.taxonomy === 'tags') {
            return `/tags/${term.slug}`;
        }

        return null;
    };

    const normalizeTermSummary = (term: BlogTermPayload | null | undefined): BlogTermSummaryData | null => {
        if (!term?.slug) {
            return null;
        }

        return {
            id: term.id ?? null,
            path: term.path ?? inferTermPath(term),
            title: term.title ?? term.slug,
            slug: term.slug,
            taxonomy: term.taxonomy ?? null
        };
    };

    const normalizeTerm = (term: BlogTermPayload | null | undefined): BlogTermData | null => {
        const summary = normalizeTermSummary(term);

        if (!summary) {
            return null;
        }

        return {
            ...summary,
            articles_count: term?.articles_count ?? null
        };
    };

    const normalizeAuthor = (author: BlogAuthorPayload | null | undefined): BlogAuthorData => ({
        name: author?.name ?? null,
        role: author?.role ?? null,
        photo: author?.photo ?? null,
        links: Array.isArray(author?.links)
            ? author.links
                .filter(link => Boolean(link?.label) && Boolean(link?.url))
                .map(link => ({
                    label: link.label as string,
                    url: link.url as string
                }))
            : []
    });

    const normalizeArticle = (article: BlogArticlePayload): BlogArticleData => ({
        id: article.id ?? null,
        path: article.path ?? null,
        title: article.title ?? article.slug ?? 'Article',
        slug: article.slug ?? '',
        excerpt: article.excerpt ?? null,
        content: article.content ?? null,
        image_url: article.image_url ?? null,
        category: normalizeTermSummary(article.category),
        tags: Array.isArray(article.tags)
            ? article.tags
                .map(tag => normalizeTermSummary(tag))
                .filter((tag): tag is BlogTermSummaryData => tag !== null)
            : [],
        author: normalizeAuthor(article.author),
        published_at: article.published_at ?? null,
        updated_at: article.updated_at ?? null,
        seo: normalizeSeo(article.seo, {
            title: article.title ?? article.slug ?? 'Article',
            description: article.excerpt ?? null
        })
    });

    const normalizeCategory = (category: BlogCategoryPayload): BlogCategoryData => {
        const term = normalizeTerm(category);

        return {
            id: term?.id ?? null,
            path: term?.path ?? `/blog/${category.slug}`,
            title: term?.title ?? category.slug ?? 'Categorie',
            slug: term?.slug ?? category.slug ?? '',
            taxonomy: term?.taxonomy ?? category.taxonomy ?? 'categories',
            articles_count: term?.articles_count ?? (Array.isArray(category.articles) ? category.articles.length : 0),
            articles: Array.isArray(category.articles) ? category.articles.map(normalizeArticle) : []
        };
    };

    const normalizeTag = (tag: BlogTagPayload): BlogTagData => {
        const term = normalizeTerm(tag);

        return {
            id: term?.id ?? null,
            path: term?.path ?? `/tags/${tag.slug}`,
            title: term?.title ?? tag.slug ?? 'Tag',
            slug: term?.slug ?? tag.slug ?? '',
            taxonomy: term?.taxonomy ?? tag.taxonomy ?? 'tags',
            articles_count: term?.articles_count ?? (Array.isArray(tag.articles) ? tag.articles.length : 0),
            articles: Array.isArray(tag.articles) ? tag.articles.map(normalizeArticle) : []
        };
    };

    const getActualCategories = (articles: BlogArticleData[]): BlogTermData[] => {
        const items = new Map<string, BlogTermData>();

        for (const article of articles) {
            if (!article.category?.slug) {
                continue;
            }

            const existing = items.get(article.category.slug);

            if (existing) {
                existing.articles_count = (existing.articles_count || 0) + 1;
                continue;
            }

            items.set(article.category.slug, {
                ...article.category,
                articles_count: 1
            });
        }

        return [...items.values()];
    };

    const fetchCollection = async <T>(path: string) => {
        return await client<T[]>(path);
    };

    const fetchResource = async <T>(path: string) => {
        return await client<T>(path);
    };

    const fetchArticles = async () => {
        const articles = await fetchCollection<BlogArticlePayload>('/blog');
        return articles.map(normalizeArticle);
    };

    const fetchCategory = async (slug: string) => {
        const category = await fetchResource<BlogCategoryPayload>(`/blog/${encodeURIComponent(slug)}`);
        return normalizeCategory(category);
    };

    const fetchArticle = async (categorySlug: string, articleSlug: string, includeNeighbors: boolean = false): Promise<BlogArticlePageData> => {
        const payload = await fetchResource<BlogArticlePagePayload>(`/blog/${encodeURIComponent(categorySlug)}/${encodeURIComponent(articleSlug)}?include_neighbors=${includeNeighbors}`);

        return {
            current_article: normalizeArticle(payload.current_article),
            previous_article: payload.previous_article ? normalizeArticle(payload.previous_article) : null,
            next_article: payload.next_article ? normalizeArticle(payload.next_article) : null
        };
    };

    const fetchTag = async (slug: string) => {
        const tag = await fetchResource<BlogTagPayload>(`/tags/${encodeURIComponent(slug)}`);
        return normalizeTag(tag);
    };

    return {
        fetchArticles,
        fetchCategory,
        fetchArticle,
        fetchTag,
        getActualCategories
    };
};

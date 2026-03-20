import { z } from 'zod';
import {
    applyContentSyncPayload,
    isFreshTimestamp,
    verifyContentSyncSignature,
    type ContentSyncPayload
} from '~~/server/utils/contentSync';

const seoSchema = z.object({
    description: z.string().trim().min(1),
    url: z.string().trim().min(1),
    card: z.string().trim().min(1),
    keywords: z.string().trim().min(1),
    robots: z.string().trim().min(1),
    lang: z.string().trim().min(1)
});

const themeUpsertSchema = z.object({
    event: z.literal('theme.upsert'),
    entity: z.literal('theme'),
    entity_id: z.string().uuid(),
    occurred_at: z.string().trim().min(1),
    data: z.object({
        id: z.string().uuid(),
        title: z.string().trim().min(1),
        slug: z.string().trim().min(1),
        position: z.number().int().positive(),
        description: z.string().trim().min(1),
        color: z.string().trim().min(1),
        image: z.object({
            src: z.string().trim().min(1)
        }),
        seo: seoSchema
    }),
    previous: z.object({
        slug: z.string().trim().min(1).optional(),
        position: z.number().int().positive().optional()
    }).default({})
});

const themeDeleteSchema = z.object({
    event: z.literal('theme.delete'),
    entity: z.literal('theme'),
    entity_id: z.string().uuid(),
    occurred_at: z.string().trim().min(1),
    data: z.object({
        id: z.string().uuid(),
        slug: z.string().trim().min(1),
        position: z.number().int().positive()
    }),
    previous: z.record(z.never()).default({})
});

const lessonUpsertSchema = z.object({
    event: z.literal('lesson.upsert'),
    entity: z.literal('lesson'),
    entity_id: z.string().uuid(),
    occurred_at: z.string().trim().min(1),
    data: z.object({
        id: z.string().uuid(),
        title: z.string().trim().min(1),
        slug: z.string().trim().min(1),
        position: z.number().int().positive(),
        description: z.string().trim().min(1),
        tags: z.array(z.string()),
        reading_time: z.number().int().positive().nullable(),
        theme: z.object({
            id: z.string().uuid(),
            slug: z.string().trim().min(1),
            position: z.number().int().positive(),
            title: z.string().trim().min(1)
        }),
        image: z.object({
            src: z.string().trim().min(1)
        }),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        biblical_references: z.array(z.string()),
        seo: seoSchema,
        body: z.string()
    }),
    previous: z.object({
        slug: z.string().trim().min(1).optional(),
        position: z.number().int().positive().optional(),
        theme_slug: z.string().trim().min(1).optional(),
        theme_position: z.number().int().positive().optional()
    }).default({})
});

const lessonDeleteSchema = z.object({
    event: z.literal('lesson.delete'),
    entity: z.literal('lesson'),
    entity_id: z.string().uuid(),
    occurred_at: z.string().trim().min(1),
    data: z.object({
        id: z.string().uuid(),
        slug: z.string().trim().min(1),
        position: z.number().int().positive(),
        theme_slug: z.string().trim().min(1),
        theme_position: z.number().int().positive()
    }),
    previous: z.record(z.never()).default({})
});

const contentSyncSchema = z.discriminatedUnion('event', [
    themeUpsertSchema,
    themeDeleteSchema,
    lessonUpsertSchema,
    lessonDeleteSchema
]);

export default defineEventHandler(async (event) => {
    const runtimeConfig = useRuntimeConfig(event);
    const key = runtimeConfig.contentSyncKey;

    if (!key) {
        throw createError({
            statusCode: 503,
            message: 'Content sync key is not configured'
        });
    }

    const providedKey = getHeader(event, 'x-content-sync-key');
    const timestamp = getHeader(event, 'x-content-sync-timestamp');
    const signature = getHeader(event, 'x-content-sync-signature');
    const rawBody = await readRawBody(event, 'utf8');

    if (!providedKey || !timestamp || !signature || !rawBody) {
        throw createError({
            statusCode: 401,
            message: 'Missing content sync authentication headers'
        });
    }

    if (providedKey !== key || !verifyContentSyncSignature(rawBody, signature, key)) {
        throw createError({
            statusCode: 401,
            message: 'Invalid content sync signature'
        });
    }

    if (!isFreshTimestamp(timestamp, runtimeConfig.contentSyncAllowedSkewSeconds)) {
        throw createError({
            statusCode: 401,
            message: 'Expired content sync request'
        });
    }

    let parsedBody: unknown;

    try {
        parsedBody = JSON.parse(rawBody);
    } catch {
        throw createError({
            statusCode: 400,
            message: 'Invalid JSON payload'
        });
    }

    const validation = contentSyncSchema.safeParse(parsedBody);

    if (!validation.success) {
        throw createError({
            statusCode: 400,
            message: 'Invalid content sync payload',
            data: validation.error.issues
        });
    }

    await applyContentSyncPayload(validation.data as ContentSyncPayload);

    return {
        success: true,
        event: validation.data.event
    };
});
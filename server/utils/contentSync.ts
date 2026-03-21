import { createHmac, timingSafeEqual } from 'node:crypto';
import { access, mkdir, readFile, rename, rm, unlink, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, resolve } from 'node:path';

export type ThemeUpsertPayload = {
    event: 'theme.upsert';
    entity: 'theme';
    entity_id: string;
    occurred_at: string;
    data: {
        id: string;
        title: string;
        slug: string;
        position: number;
        description: string;
        color: string;
        image: {
            src: string;
        };
        seo: {
            description: string;
            url: string;
            card: string;
            keywords: string;
            robots: string;
            lang: string;
        };
    };
    previous: {
        slug?: string;
        position?: number;
    };
};

export type ThemeDeletePayload = {
    event: 'theme.delete';
    entity: 'theme';
    entity_id: string;
    occurred_at: string;
    data: {
        id: string;
        slug: string;
        position: number;
    };
    previous: Record<string, never>;
};

export type LessonUpsertPayload = {
    event: 'lesson.upsert';
    entity: 'lesson';
    entity_id: string;
    occurred_at: string;
    data: {
        id: string;
        title: string;
        slug: string;
        position: number;
        description: string;
        tags: string[];
        reading_time: number | null;
        theme: {
            id: string;
            slug: string;
            position: number;
            title: string;
        };
        image: {
            src: string;
        };
        date: string;
        biblical_references: string[];
        seo: {
            description: string;
            url: string;
            card: string;
            keywords: string;
            robots: string;
            lang: string;
        };
        body: string;
    };
    previous: {
        slug?: string;
        position?: number;
        theme_slug?: string;
        theme_position?: number;
    };
};

export type LessonDeletePayload = {
    event: 'lesson.delete';
    entity: 'lesson';
    entity_id: string;
    occurred_at: string;
    data: {
        id: string;
        slug: string;
        position: number;
        theme_slug: string;
        theme_position: number;
    };
    previous: Record<string, never>;
};

export type ContentSyncPayload = ThemeUpsertPayload | ThemeDeletePayload | LessonUpsertPayload | LessonDeletePayload;

const contentRoot = resolve(process.cwd(), 'content/2.enseignements');

export function verifyContentSyncSignature(rawBody: string, providedSignature: string, key: string): boolean {
    const expected = createHmac('sha256', key).update(rawBody).digest('hex');

    if (expected.length !== providedSignature.length) {
        return false;
    }

    return timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(providedSignature, 'utf8'));
}

export function isFreshTimestamp(timestamp: string, allowedSkewSeconds: number): boolean {
    const parsed = Date.parse(timestamp);

    if (Number.isNaN(parsed)) {
        return false;
    }

    return Math.abs(Date.now() - parsed) <= allowedSkewSeconds * 1000;
}

export async function applyContentSyncPayload(payload: ContentSyncPayload): Promise<void> {
    switch (payload.event) {
        case 'theme.upsert':
            await applyThemeUpsert(payload);
            return;
        case 'theme.delete':
            await rm(themeDirectoryPath(payload.data.position, payload.data.slug), { recursive: true, force: true });
            return;
        case 'lesson.upsert':
            await applyLessonUpsert(payload);
            return;
        case 'lesson.delete':
            await unlinkIfExists(lessonFilePath(
                payload.data.theme_position,
                payload.data.theme_slug,
                payload.data.position,
                payload.data.slug
            ));
            return;
    }
}

async function applyThemeUpsert(payload: ThemeUpsertPayload): Promise<void> {
    const currentDirectory = themeDirectoryPath(payload.data.position, payload.data.slug);
    const previousDirectory = themeDirectoryPath(
        payload.previous.position ?? payload.data.position,
        payload.previous.slug ?? payload.data.slug
    );

    if (previousDirectory !== currentDirectory) {
        await moveDirectory(previousDirectory, currentDirectory);
    }

    await mkdir(currentDirectory, { recursive: true });
    await writeFile(resolve(currentDirectory, 'index.yml'), renderThemeIndex(payload), 'utf8');
}

async function applyLessonUpsert(payload: LessonUpsertPayload): Promise<void> {
    const currentPath = lessonFilePath(
        payload.data.theme.position,
        payload.data.theme.slug,
        payload.data.position,
        payload.data.slug
    );
    const previousPath = lessonFilePath(
        payload.previous.theme_position ?? payload.data.theme.position,
        payload.previous.theme_slug ?? payload.data.theme.slug,
        payload.previous.position ?? payload.data.position,
        payload.previous.slug ?? payload.data.slug
    );

    if (previousPath !== currentPath) {
        await moveFile(previousPath, currentPath);
    }

    await mkdir(dirname(currentPath), { recursive: true });
    await writeFile(currentPath, renderLessonFile(payload), 'utf8');
}

function themeDirectoryPath(position: number, slug: string): string {
    return resolve(contentRoot, `${position}.${slug}`);
}

function lessonFilePath(themePosition: number, themeSlug: string, lessonPosition: number, lessonSlug: string): string {
    return resolve(themeDirectoryPath(themePosition, themeSlug), `${lessonPosition}.${lessonSlug}.md`);
}

async function moveDirectory(from: string, to: string): Promise<void> {
    if (from === to || !await pathExists(from)) {
        return;
    }

    if (!await pathExists(to)) {
        await mkdir(dirname(to), { recursive: true });
        await rename(from, to);
        return;
    }

    await rm(from, { recursive: true, force: true });
}

async function moveFile(from: string, to: string): Promise<void> {
    if (from === to || !await pathExists(from)) {
        return;
    }

    await mkdir(dirname(to), { recursive: true });

    if (!await pathExists(to)) {
        await rename(from, to);
        return;
    }

    await unlinkIfExists(from);
}

async function unlinkIfExists(path: string): Promise<void> {
    if (!await pathExists(path)) {
        return;
    }

    await unlink(path);
}

async function pathExists(path: string): Promise<boolean> {
    try {
        await access(path, constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

function renderThemeIndex(payload: ThemeUpsertPayload): string {
    const { data } = payload;

    return [
        `title: ${yamlString(data.title)}`,
        `slug: ${yamlString(data.slug)}`,
        `description: ${yamlString(data.description)}`,
        `color: ${data.color}`,
        'image:',
        `  src: ${yamlString(data.image.src)}`,
        'seo:',
        `  description: ${yamlString(data.seo.description)}`,
        `  card: ${yamlString(data.seo.card)}`,
        `  keywords: ${yamlString(data.seo.keywords)}`,
        `  robots: ${yamlString(data.seo.robots)}`,
        `  url: ${yamlString(data.seo.url)}`,
        `  lang: ${yamlString(data.seo.lang)}`,
        ''
    ].join('\n');
}

function renderLessonFile(payload: LessonUpsertPayload): string {
    const { data } = payload;

    return [
        '---',
        `title: ${yamlString(data.title)}`,
        `slug: ${yamlString(data.slug)}`,
        `description: ${yamlString(data.description)}`,
        `tags: ${JSON.stringify(data.tags)}`,
        data.reading_time === null ? null : `reading_time: ${data.reading_time}`,
        `theme: ${yamlString(data.theme.slug)}`,
        'image:',
        `  src: ${yamlString(data.image.src)}`,
        `date: ${data.date}`,
        `biblical_references: ${JSON.stringify(data.biblical_references)}`,
        'seo:',
        `  description: ${yamlString(data.seo.description)}`,
        `  url: ${yamlString(data.seo.url)}`,
        `  card: ${yamlString(data.seo.card)}`,
        `  robots: ${yamlString(data.seo.robots)}`,
        `  keywords: ${yamlString(data.seo.keywords)}`,
        `  lang: ${yamlString(data.seo.lang)}`,
        '---',
        '',
        data.body.trim(),
        ''
    ].filter((line): line is string => line !== null).join('\n');
}

function yamlString(value: string): string {
    return JSON.stringify(value);
}

export async function readContentFile(relativePath: string): Promise<string> {
    return await readFile(resolve(contentRoot, relativePath), 'utf8');
}

import type { BlogAuthorData } from '~/types';

export const toBlogPostAuthors = (author: BlogAuthorData) => {
    if (!author.name) {
        return undefined;
    }

    const singleLink = author.links.length === 1 ? author.links[0]?.url : undefined;

    return [{
        name: author.name,
        description: author.role || undefined,
        avatar: author.photo ? { src: author.photo } : undefined,
        to: singleLink || undefined,
        target: singleLink ? '_blank' : undefined
    }];
};

const knownIconDomains: Record<string, string> = {
    twitter: 'mdi:twitter',
    facebook: 'mdi:facebook',
    linkedin: 'mdi:linkedin',
    github: 'mdi:github',
    instagram: 'mdi:instagram',
    tiktok: 'formkit:tiktok',
    youtube: 'mdi:youtube',
    website: 'mdi:web'
};

const defaultIcon = 'mdi:web';

export const toAuthorLinkButtons = (author: BlogAuthorData) => {
    return author.links
        .filter(link => Boolean(link.url) && Boolean(link.label))
        .map(link => ({
            label: link.label,
            to: link.url,
            icon: knownIconDomains[link.label.toLowerCase()] || defaultIcon
        }));
};

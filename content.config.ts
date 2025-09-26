import { defineCollection, z } from '@nuxt/content';

const variantEnum = z.enum(['solid', 'outline', 'subtle', 'soft', 'ghost', 'link']);
const colorEnum = z.enum(['primary', 'secondary', 'neutral', 'error', 'warning', 'success', 'info']);
const sizeEnum = z.enum(['xs', 'sm', 'md', 'lg', 'xl']);
const orientationEnum = z.enum(['vertical', 'horizontal']);

const createBaseSchema = () => z.object({
    title: z.string().nonempty(),
    description: z.string().nonempty()
});

const createLinkSchema = () => z.object({
    label: z.string().nonempty(),
    to: z.string().nonempty(),
    icon: z.string().optional().editor({ input: 'icon' }),
    size: sizeEnum.optional(),
    trailing: z.boolean().optional(),
    target: z.string().optional(),
    color: colorEnum.optional(),
    variant: variantEnum.optional()
});

const createSeoSchema = () => z.object({
    description: z.string().nonempty(),
    url: z.string().nonempty(),
    card: z.enum(['summary', 'summary_large_image', 'app', 'player']),
    keywords: z.string().nonempty(),
    robots: z.string().nonempty(),
    lang: z.string().nonempty()
});

export const collections = {
    index: defineCollection({
        source: '0.index.yml',
        type: 'page',
        schema: z.object({
            title: z.string().nonempty(),
            description: z.string().nonempty(),
            hero: z.object({
                badge: z.object({
                    icon: z.string().nonempty().editor({ input: 'icon' }),
                    text: z.string().nonempty()
                }),
                title: z.string().nonempty(),
                titleHighlight: z.string().nonempty(),
                subtitle: z.string().nonempty(),
                primaryCta: z.object({
                    text: z.string().nonempty(),
                    icon: z.string().nonempty().editor({ input: 'icon' }),
                    link: z.string().nonempty()
                }),
                secondaryCta: z.object({
                    text: z.string().nonempty(),
                    icon: z.string().nonempty().editor({ input: 'icon' }),
                    link: z.string().nonempty()
                })
            }),
            mission: z.object({
                badge: z.object({
                    icon: z.string().nonempty().editor({ input: 'icon' }),
                    text: z.string().nonempty()
                }),
                title: z.string().nonempty(),
                subtitle: z.string().nonempty(),
                pillars: z.array(z.object({
                    title: z.string().nonempty(),
                    icon: z.string().nonempty().editor({ input: 'icon' }),
                    color: z.string().nonempty(),
                    description: z.string().nonempty()
                })),
                verse: z.object({
                    text: z.string().nonempty(),
                    reference: z.string().nonempty(),
                    commentary: z.string().nonempty()
                })
            }),
            teachings: z.object({
                badge: z.object({
                    icon: z.string().nonempty().editor({ input: 'icon' }),
                    text: z.string().nonempty()
                }),
                title: z.string().nonempty(),
                subtitle: z.string().nonempty(),
                courses: z.array(z.object({
                    title: z.string().nonempty(),
                    name: z.string().nonempty(),
                    image: z.string().nonempty().editor({ input: 'media' }),
                    description: z.string().nonempty(),
                    lessons: z.number().min(0).optional(),
                    link: z.string().nonempty()
                })),
                allCoursesCard: z.object({
                    title: z.string().nonempty(),
                    description: z.string().nonempty(),
                    cta: z.string().nonempty(),
                    link: z.string().nonempty()
                })
            }),
            testimonials: z.object({
                badge: z.object({
                    icon: z.string().nonempty().editor({ input: 'icon' }),
                    text: z.string().nonempty()
                }),
                title: z.string().nonempty(),
                subtitle: z.string().nonempty(),
                reviews: z.array(z.object({
                    name: z.string().nonempty(),
                    role: z.string().nonempty(),
                    image: z.string().nonempty().editor({ input: 'media' }),
                    quote: z.string().nonempty()
                })),
                stats: z.array(z.object({
                    number: z.string().nonempty(),
                    label: z.string().nonempty(),
                    color: z.string().nonempty()
                }))
            }),
            cta: z.object({
                title: z.string().nonempty(),
                titleHighlight: z.string().nonempty(),
                subtitle: z.string().nonempty(),
                primaryButton: z.object({
                    text: z.string().nonempty(),
                    icon: z.string().nonempty().editor({ input: 'icon' }),
                    link: z.string().nonempty()
                }),
                secondaryButton: z.object({
                    text: z.string().nonempty(),
                    icon: z.string().nonempty().editor({ input: 'icon' }),
                    link: z.string().nonempty()
                }),
                benefits: z.string().nonempty()
            }),
            seo: z.object({
                title: z.string().nonempty(),
                description: z.string().nonempty(),
                ogTitle: z.string().nonempty(),
                ogDescription: z.string().nonempty(),
                ogImage: z.string().nonempty().editor({ input: 'media' })
            })
        })
    }),
    docs: defineCollection({
        source: '1.docs/**/*',
        type: 'page'
    }),
    pricing: defineCollection({
        source: '2.pricing.yml',
        type: 'page',
        schema: z.object({
            plans: z.array(
                z.object({
                    title: z.string().nonempty(),
                    description: z.string().nonempty(),
                    price: z.object({
                        month: z.string().nonempty(),
                        year: z.string().nonempty()
                    }),
                    billing_period: z.string().nonempty(),
                    billing_cycle: z.string().nonempty(),
                    button: createLinkSchema(),
                    features: z.array(z.string().nonempty()),
                    highlight: z.boolean().optional()
                })
            ),
            logos: z.object({
                title: z.string().nonempty(),
                icons: z.array(z.string())
            }),
            faq: createBaseSchema().extend({
                items: z.array(
                    z.object({
                        label: z.string().nonempty(),
                        content: z.string().nonempty(),
                        defaultOpen: z.boolean().optional()
                    })
                )
            })
        })
    }),
    blog: defineCollection({
        source: '3.blog.yml',
        type: 'page'
    }),
    posts: defineCollection({
        source: '3.blog/**/*',
        type: 'page',
        schema: z.object({
            image: z.object({ src: z.string().nonempty().editor({ input: 'media' }) }),
            author: z.object({
                name: z.string().nonempty(),
                to: z.string().nullable(),
                avatar: z.object({ src: z.string().nonempty().editor({ input: 'media' }) })
            }),
            date: z.date(),
            badge: z.object({ label: z.string().nonempty() }),
            seo: createSeoSchema()
        })
    }),
    teaching: defineCollection({
        source: '2.enseignements.yml',
        type: 'page'
    }),
    lessons: defineCollection({
        source: '2.enseignements/**/*.md',
        type: 'page',
        schema: z.object({
            image: z.object({ src: z.string().nonempty().editor({ input: 'media' }) }),
            biblical_references: z.array(z.string().nonempty()).optional(),
            date: z.date(),
            tags: z.array(z.string().nonempty()),
            theme: z.string().nonempty(),
            reading_time: z.number().optional(),
            slug: z.string().nonempty(),
            seo: createSeoSchema()
        })
    }),
    themes: defineCollection({
        source: '2.enseignements/**/*',
        type: 'page',
        schema: z.object({
            title: z.string().nonempty(),
            image: z.object({ src: z.string().nonempty().editor({ input: 'media' }) }),
            slug: z.string().nonempty(),
            description: z.string().nonempty(),
            color: colorEnum.optional().default('primary'),
            seo: createSeoSchema()
        })
    }),
    about: defineCollection({
        source: '4.about.yml',
        type: 'page',
        schema: z.object({
            hero: z.object({
                links: z.array(createLinkSchema())
            }),
            sections: z.array(
                createBaseSchema().extend({
                    id: z.string().optional(),
                    orientation: orientationEnum.optional(),
                    reverse: z.boolean().optional()
                })
            ),
            stats: z.array(
                z.object({
                    label: z.string().nonempty(),
                    value: z.string().nonempty(),
                    description: z.string().nonempty()
                })
            ),
            quotation: z.object({
                quote: z.string().nonempty(),
                author: z.string().nonempty(),
                role: z.string().nonempty()
            }),
            seo: z.object({
                title: z.string().nonempty(),
                description: z.string().nonempty()
            }).optional()
        })
    }),
    versions: defineCollection({
        source: '4.about/**/*',
        type: 'page',
        schema: z.object({
            title: z.string().nonempty(),
            description: z.string(),
            date: z.date(),
            image: z.string()
        })
    })
};

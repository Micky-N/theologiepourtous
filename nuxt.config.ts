// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: [
        '@nuxt/eslint',
        '@nuxt/image',
        '@nuxt/ui',
        '@nuxt/content',
        '@vueuse/nuxt',
        'nuxt-og-image',
        'nuxt-auth-utils'
    ],

    devtools: {
        enabled: true
    },

    css: ['~/assets/css/main.css'],

    content: {
        preview: {
            api: 'https://api.nuxt.studio'
        },
        build: {
            transformers: [
                '~~/src/transformers/component-parser'
            ]
        }
    },

    routeRules: {
        '/docs': { redirect: '/docs/getting-started', prerender: false }
    },

    compatibilityDate: '2025-06-01',

    nitro: {
        prerender: {
            routes: [
                '/'
            ],
            crawlLinks: true
        }
    },

    auth: {
        loadStrategy: 'server-first'
    },

    eslint: {
        config: {
            stylistic: {
                commaDangle: 'never',
                braceStyle: '1tbs'
            }
        }
    }
});

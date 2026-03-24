// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: [
        '@nuxt/eslint',
        '@nuxt/image',
        '@nuxt/ui',
        '@nuxt/content',
        '@vueuse/nuxt',
        'nuxt-og-image',
        'nuxt-auth-sanctum'
    ],

    ssr: true,

    devtools: {
        enabled: true
    },

    css: ['~/assets/css/main.css'],

    runtimeConfig: {
        public: {
            apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000'
        }
    },

    routeRules: {
        '/docs': { redirect: '/docs/getting-started', prerender: false }
    },

    compatibilityDate: '2024-07-11',

    nitro: {
        prerender: {
            routes: [
                '/'
            ],
            crawlLinks: true
        }
    },

    eslint: {
        config: {
            stylistic: {
                commaDangle: 'never',
                braceStyle: '1tbs'
            }
        }
    },

    sanctum: {
        mode: 'cookie',
        baseUrl: '/api/sanctum',
        endpoints: {
            user: '/me'
        },
        redirect: {
            onLogin: false,
            onLogout: false
        },
        serverProxy: {
            enabled: true,
            route: '/api/sanctum',
            baseUrl: process.env.NUXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000'
        }
    }

});

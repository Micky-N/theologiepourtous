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
        backendApiBaseUrl: process.env.NUXT_BACKEND_API_BASE_URL ?? 'http://localhost:8000/api/v1',
        frontendProxySecret: process.env.FRONTEND_PROXY_SECRET ?? '',
        public: {}
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
            csrf: '/sanctum/csrf-cookie',
            user: '/me'
        },
        redirect: {
            onLogin: false,
            onLogout: false
        },
        serverProxy: {
            enabled: true,
            route: '/api/sanctum',
            baseUrl: process.env.NUXT_BACKEND_API_BASE_URL ?? 'http://localhost:8000/api/v1'
        }
    }

});

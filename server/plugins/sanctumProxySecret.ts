type SanctumProxyRequestContext = {
    options: {
        headers?: HeadersInit;
    };
};

type SanctumProxyHooks = {
    hook: (name: 'sanctum:proxy:request', callback: (ctx: SanctumProxyRequestContext) => void) => void;
};

export default defineNitroPlugin((nitroApp) => {
    (nitroApp.hooks as SanctumProxyHooks).hook('sanctum:proxy:request', (ctx) => {
        const runtimeConfig = useRuntimeConfig();
        const secret = runtimeConfig.frontendProxySecret;

        if (!secret) {
            return;
        }

        const headers = ctx.options.headers instanceof Headers
            ? ctx.options.headers
            : new Headers(ctx.options.headers ?? {});

        headers.set('X-Frontend-Proxy-Secret', secret);
        ctx.options.headers = headers;
    });
});

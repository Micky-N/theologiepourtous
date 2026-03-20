export default defineNuxtRouteMiddleware((to) => {
    const { isAuthenticated } = useSanctumAuth();

    // redirect the user to the login screen if they're not authenticated
    if (!isAuthenticated.value) {
        return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
    }
});

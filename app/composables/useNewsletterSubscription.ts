export const useNewsletterSubscription = () => {
    const client = useSanctumClient();

    const subscribe = async (email: string) => {
        const response = await client<{ message?: string; data?: { email?: string; }; }>('/newsletter-subscriptions', {
            method: 'POST',
            body: { email }
        });

        return {
            success: true,
            message: response.message || 'Inscription à la newsletter confirmée.',
            email: response.data?.email ?? email
        };
    };

    return {
        subscribe
    };
};

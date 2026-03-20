import type { AuthenticatedUserData } from '~/types';

type UpdateProfilePayload = {
    name: string;
    email: string;
    currentPassword: string | null;
    newPassword: string | null;
    confirmPassword: string | null;
};

export const useUserProfile = () => {
    const client = useSanctumClient();
    const user = useSanctumUser<AuthenticatedUserData>();
    const { refreshIdentity } = useSanctumAuth();
    const tokenCookie = useCookie<string | null>('sanctum.token.cookie');

    const updateProfile = async (payload: UpdateProfilePayload) => {
        const response = await client<{ message?: string; }>('/profile', {
            method: 'PUT',
            body: {
                name: payload.name,
                email: payload.email,
                current_password: payload.currentPassword,
                new_password: payload.newPassword,
                confirm_password: payload.confirmPassword
            }
        });

        await refreshIdentity();

        return {
            success: true,
            message: response.message || 'Utilisateur mis à jour avec succès'
        };
    };

    const deleteAccount = async (password: string) => {
        const response = await client<{ message?: string; }>('/profile/delete-account', {
            method: 'POST',
            body: { password }
        });

        tokenCookie.value = null;
        user.value = null;

        return {
            success: true,
            message: response.message || 'Compte supprimé avec succès'
        };
    };

    return {
        updateProfile,
        deleteAccount
    };
};

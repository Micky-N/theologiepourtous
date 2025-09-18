export default defineEventHandler(async (event) => {
    if (event.node.req.method !== 'POST') {
        throw createError({
            statusCode: 405,
            statusMessage: 'Method Not Allowed'
        })
    }

    try {
        // Supprimer le cookie d'authentification
        deleteCookie(event, 'auth-token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        })

        return {
            success: true,
            message: 'Déconnexion réussie'
        }
    } catch (error: any) {
        console.error('Erreur lors de la déconnexion:', error)

        throw createError({
            statusCode: 500,
            statusMessage: 'Erreur interne du serveur'
        })
    }
})

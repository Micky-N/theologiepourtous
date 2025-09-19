import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import type { JWTPayload } from '~/types'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'

/**
 * Génère un token JWT pour un utilisateur
 */
export function generateJWT(userId: number, email?: string): string {
    const payload = {
        userId,
        ...(email && { email })
    }

    return jwt.sign(payload, JWT_SECRET!, { expiresIn: '7d' })
}

/**
 * Vérifie et décode un token JWT
 */
export function verifyJWT(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET!) as JWTPayload
    } catch {
        return null
    }
}

/**
 * Hash un mot de passe avec bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
}

/**
 * Vérifie un mot de passe avec bcrypt
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
}

/**
 * Middleware pour vérifier l'authentification
 */
export async function requireAuth(event: any): Promise<number> {
    const token = getCookie(event, 'auth-token')

    if (!token) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Token d\'authentification manquant'
        })
    }

    const payload = verifyJWT(token)
    if (!payload) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Token d\'authentification invalide'
        })
    }

    return payload.userId
}

/**
 * Valide le format d'un email
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * Valide la force d'un mot de passe
 */
export function isValidPassword(password: string): { valid: boolean, message?: string } {
    if (password.length < 6) {
        return { valid: false, message: 'Le mot de passe doit contenir au moins 6 caractères' }
    }

    if (!/(?=.*[a-z])/.test(password)) {
        return { valid: false, message: 'Le mot de passe doit contenir au moins une minuscule' }
    }

    if (!/(?=.*[A-Z])/.test(password)) {
        return { valid: false, message: 'Le mot de passe doit contenir au moins une majuscule' }
    }

    if (!/(?=.*\d)/.test(password)) {
        return { valid: false, message: 'Le mot de passe doit contenir au moins un chiffre' }
    }

    return { valid: true }
}

/**
 * Définit un cookie d'authentification sécurisé
 */
export function setAuthCookie(event: any, token: string) {
    setCookie(event, 'auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 // 7 jours
    })
}

/**
 * Supprime le cookie auth
 */
export function clearAuthCookie(event: any) {
    deleteCookie(event, 'auth_token')
}

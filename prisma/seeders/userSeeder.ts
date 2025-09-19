import type { PrismaClient } from '../../app/generated/prisma'

// Utilisateurs à créer
const users = [
    {
        email: 'admin@example.com',
        name: 'Mickael Ndinga',
        password: '$2b$10$rXVl9.tQOF8jxZzR.UzHvO5Q5M4QXFcF5H7Ks6Q8R4Y.N3XUJWZSG', // "admin123"
        role: 'ADMIN'
    },
    {
        email: 'user1@example.com',
        name: 'Jean Dupont',
        password: '$2b$10$rXVl9.tQOF8jxZzR.UzHvO5Q5M4QXFcF5H7Ks6Q8R4Y.N3XUJWZSG', // "password123"
        role: 'USER'
    },
    {
        email: 'user2@example.com',
        name: 'Marie Martin',
        password: '$2b$10$rXVl9.tQOF8jxZzR.UzHvO5Q5M4QXFcF5H7Ks6Q8R4Y.N3XUJWZSG', // "password123"
        role: 'USER'
    },
    {
        email: 'user3@example.com',
        name: 'Pierre Durand',
        password: '$2b$10$rXVl9.tQOF8jxZzR.UzHvO5Q5M4QXFcF5H7Ks6Q8R4Y.N3XUJWZSG', // "password123"
        role: 'USER'
    }
] as const

export async function main(prismaClient: PrismaClient) {
    console.log('🌱 Starting User seeding...')

    // Créer les utilisateurs
    console.log('👥 Creating users...')
    for (const userData of users) {
        const user = await prismaClient.user.upsert({
            where: { email: userData.email },
            update: {},
            create: {
                email: userData.email,
                name: userData.name,
                password: userData.password,
                role: userData.role
            }
        })
        console.log(`  ✓ ${user.name} (${user.email}) - Role: ${user.role}`)
    }

    console.log('\n✅ User seeding completed!')
    console.log(`   👥 ${users.length} users created`)
    console.log(`   🔧 ${users.filter(u => u.role === 'ADMIN').length} admin(s)`)
    console.log(`   👤 ${users.filter(u => u.role === 'USER').length} regular user(s)`)
    console.log('\n📝 Note: All passwords are hashed. Default password is "password123" for users and "admin123" for admin.')
}

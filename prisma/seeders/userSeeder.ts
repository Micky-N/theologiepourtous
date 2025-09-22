import type { PrismaClient } from '@prisma/client';

// Utilisateurs à créer
const users = [
    {
        email: 'admin@example.com',
        name: 'Mickael Ndinga',
        password: '$scrypt$n=16384,r=8,p=1$AQGUuBV4Tp00omSlbdEgnA$KXPfmME+XO/G5NBfuSmf3dXv0mUl6JJb4X6H2dmIi7UnD9/R0xqbTGpB/rUbDh3rzoTUIgvmzXoDaiU8yUaY9w',
        role: 'ADMIN'
    },
    {
        email: 'user1@example.com',
        name: 'Jean Dupont',
        password: '$scrypt$n=16384,r=8,p=1$rZA/f/1iErzc4twSB5XQkQ$NCFE06l819UhCu9YcQNLNAfZFEfQMtR8gz06Khy+GzAIPxzD844MnPPWsrCwT6vwtb1Wl1bmd0bVCqzHstQDwQ',
        role: 'USER'
    },
    {
        email: 'user2@example.com',
        name: 'Marie Martin',
        password: '$scrypt$n=16384,r=8,p=1$rZA/f/1iErzc4twSB5XQkQ$NCFE06l819UhCu9YcQNLNAfZFEfQMtR8gz06Khy+GzAIPxzD844MnPPWsrCwT6vwtb1Wl1bmd0bVCqzHstQDwQ',
        role: 'USER'
    },
    {
        email: 'user3@example.com',
        name: 'Pierre Durand',
        password: '$scrypt$n=16384,r=8,p=1$rZA/f/1iErzc4twSB5XQkQ$NCFE06l819UhCu9YcQNLNAfZFEfQMtR8gz06Khy+GzAIPxzD844MnPPWsrCwT6vwtb1Wl1bmd0bVCqzHstQDwQ',
        role: 'USER'
    }
] as const;

export async function main(prismaClient: PrismaClient) {
    console.log('🌱 Starting User seeding...');

    // Créer les utilisateurs
    console.log('👥 Creating users...');
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
        });
        console.log(`  ✓ ${user.name} (${user.email}) - Role: ${user.role}`);
    }

    console.log('\n✅ User seeding completed!');
    console.log(`   👥 ${users.length} users created`);
    console.log(`   🔧 ${users.filter(u => u.role === 'ADMIN').length} admin(s)`);
    console.log(`   👤 ${users.filter(u => u.role === 'USER').length} regular user(s)`);
    console.log('\n📝 Note: All passwords are hashed. Default password is "password123" for users and "admin123" for admin.');
}

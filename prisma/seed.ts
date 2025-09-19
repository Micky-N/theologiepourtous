import { prisma } from '../lib/prisma'
import type { PrismaClient } from '../app/generated/prisma'
import { main as bibleSeederMain } from './seeders/bibleSeeder'
import { main as userSeederMain } from './seeders/userSeeder'

async function main(prismaClient: PrismaClient) {
    await bibleSeederMain(prismaClient)
    await userSeederMain(prismaClient)
}

main(prisma)
    .catch((e) => {
        console.error('❌ Seeding failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

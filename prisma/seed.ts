import { PrismaClient } from '../app/generated/prisma'
import { main as bibleSeederMain } from './seeders/bibleSeeder'
import { main as userSeederMain } from './seeders/userSeeder'

const prisma = new PrismaClient()

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

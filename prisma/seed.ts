import { PrismaClient } from '../app/generated/prisma/index.js'
import { main as bibleSeederMain } from './seeders/bibleSeeder.ts'
import { main as userSeederMain } from './seeders/userSeeder.ts'

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

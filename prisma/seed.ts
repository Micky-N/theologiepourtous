import { prisma } from '../lib/prisma';
import type { PrismaClient } from '@prisma/client';
import { main as bibleSeederMain } from './seeders/bibleSeeder';

async function main(prismaClient: PrismaClient) {
    await bibleSeederMain(prismaClient);
}

main(prisma)
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

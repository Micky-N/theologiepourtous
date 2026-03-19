import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const env = (globalThis as { process?: { env?: Record<string, string | undefined>; }; }).process?.env;

const provider = env?.DATABASE_PROVIDER?.trim().toLowerCase();

const supportedProviders = {
    mysql: {
        schema: 'prisma/schema.mysql.prisma',
        migrationsPath: 'prisma/migrations'
    },
    sqlite: {
        schema: 'prisma/schema.sqlite.prisma',
        migrationsPath: 'prisma/migrations-sqlite'
    }
} as const;

if (!provider || !(provider in supportedProviders)) {
    throw new Error(
        'DATABASE_PROVIDER doit etre defini sur "mysql" ou "sqlite".'
    );
}

const prismaTarget = supportedProviders[provider as keyof typeof supportedProviders];

export default defineConfig({
    schema: prismaTarget.schema,
    migrations: {
        path: prismaTarget.migrationsPath
    }
});

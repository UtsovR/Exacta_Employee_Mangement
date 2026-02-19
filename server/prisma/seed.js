const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });

const normalizeDatabaseUrl = (value) => {
    if (!value || typeof value !== 'string') {
        return value;
    }

    let normalized = value.trim();
    const isDoubleQuoted = normalized.startsWith('"') && normalized.endsWith('"');
    const isSingleQuoted = normalized.startsWith("'") && normalized.endsWith("'");

    if (isDoubleQuoted || isSingleQuoted) {
        normalized = normalized.slice(1, -1).trim();
    }

    return normalized;
};

const ensureDatabaseUrl = () => {
    const rawUrl = process.env.DATABASE_URL;
    const normalizedUrl = normalizeDatabaseUrl(rawUrl);

    if (!normalizedUrl) {
        throw new Error(
            'DATABASE_URL is required. Set it to your PostgreSQL URL before running seed.'
        );
    }

    if (
        !normalizedUrl.startsWith('postgresql://') &&
        !normalizedUrl.startsWith('postgres://')
    ) {
        throw new Error(
            'DATABASE_URL must start with "postgresql://" or "postgres://".'
        );
    }

    process.env.DATABASE_URL = normalizedUrl;
};

async function main() {
    ensureDatabaseUrl();
    const prisma = new PrismaClient();

    try {
        const adminPassword = process.env.SEED_ADMIN_PASSWORD;
        if (!adminPassword) {
            throw new Error('SEED_ADMIN_PASSWORD is required for seeding admin user');
        }

        const adminEmail = process.env.SEED_ADMIN_EMAIL || null;
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const admin = await prisma.user.upsert({
            where: { empId: 'ADMIN' },
            update: {
                password: hashedPassword,
                name: 'System Admin',
                email: adminEmail,
                role: 'ADMIN',
                team: null,
                currentStatus: 'WORKING',
                isActive: true,
            },
            create: {
                empId: 'ADMIN',
                password: hashedPassword,
                name: 'System Admin',
                email: adminEmail,
                role: 'ADMIN',
                team: null,
                currentStatus: 'WORKING',
                isActive: true,
            },
        });

        console.log({ admin });
    } finally {
        await prisma.$disconnect();
    }
}

main()
    .catch(async (e) => {
        console.error(e);
        process.exit(1);
    });

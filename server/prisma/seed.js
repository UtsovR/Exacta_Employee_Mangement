const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const adminPassword = process.env.SEED_ADMIN_PASSWORD;
    if (!adminPassword) {
        throw new Error('SEED_ADMIN_PASSWORD is required for seeding admin user');
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.upsert({
        where: { empId: 'ADMIN' },
        update: {},
        create: {
            empId: 'ADMIN',
            password: hashedPassword,
            name: 'System Admin',
            role: 'ADMIN',
            team: null,
        },
    });

    console.log({ admin });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });

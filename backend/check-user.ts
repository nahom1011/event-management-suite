import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];
    if (!email) {
        console.error('Please provide an email');
        process.exit(1);
    }

    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, emailVerified: true, status: true }
    });

    if (user) {
        console.log('USER_FOUND:', JSON.stringify(user));
    } else {
        console.log('USER_NOT_FOUND');
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

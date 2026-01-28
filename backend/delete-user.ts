import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];
    if (!email) {
        console.error('Please provide an email');
        process.exit(1);
    }

    try {
        const deletedUser = await prisma.user.delete({
            where: { email },
        });
        console.log('USER_DELETED:', JSON.stringify(deletedUser));
    } catch (error) {
        console.error('Error deleting user:', error);
        process.exit(1);
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

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function promote(email: string) {
    try {
        const user = await prisma.user.update({
            where: { email },
            data: {
                role: 'admin',
                organizerProfile: {
                    upsert: {
                        create: {
                            organizationName: `${email.split('@')[0]}'s Hub`,
                            verificationStatus: 'approved'
                        },
                        update: {
                            verificationStatus: 'approved'
                        }
                    }
                }
            },
        });
        console.log(`User ${email} has been promoted to admin and organizer status.`);
        console.log(user);
    } catch (error) {
        console.error(`Error promoting user ${email}:`, error);
    } finally {
        await prisma.$disconnect();
    }
}

const email = process.argv[2];
if (!email) {
    console.error('Please provide an email address.');
    process.exit(1);
}

promote(email);

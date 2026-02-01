import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await require('bcryptjs').hash('password123', 12);
    const user = await prisma.user.upsert({
        where: { email: 'organizer@example.com' },
        update: {
            password: hashedPassword,
            emailVerified: true,
            status: 'ACTIVE',
            isActive: true,
            role: 'organizer',
        },
        create: {
            name: 'Test Organizer',
            email: 'organizer@example.com',
            role: 'organizer',
            password: hashedPassword,
            emailVerified: true,
            status: 'ACTIVE',
            isActive: true,
        },
    });
    console.log('Ensured test organizer:', user.email);

    const regularUser = await prisma.user.upsert({
        where: { email: 'user@example.com' },
        update: {
            password: hashedPassword,
            emailVerified: true,
            status: 'ACTIVE',
            isActive: true,
            role: 'user',
        },
        create: {
            name: 'Regular User',
            email: 'user@example.com',
            role: 'user',
            password: hashedPassword,
            emailVerified: true,
            status: 'ACTIVE',
            isActive: true,
        },
    });
    console.log('Ensured regular user:', regularUser.email);

    // Ensure organizer profile exists for first user
    const organizer = await prisma.organizerProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
            userId: user.id,
            organizationName: "Dream Events",
        }
    });

    const event = await prisma.event.create({
        data: {
            title: "MEGA NEON FESTIVAL 2026",
            description: "Experience the ultimate electronic music festival with top DJs and stunning light shows.",
            location: "San Francisco, CA",
            startDate: new Date("2026-07-15T20:00:00Z"),
            endDate: new Date("2026-07-16T04:00:00Z"),
            status: "live",
            organizerId: organizer.id,
            ticketTypes: {
                create: [
                    { name: "General Admission", price: 45.00, quantity: 100 },
                    { name: "VIP Pass", price: 120.00, quantity: 20 }
                ]
            }
        }
    });

    console.log('Created event:', event);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());

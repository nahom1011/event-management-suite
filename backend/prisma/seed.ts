import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findFirst();
    if (!user) {
        console.log('No user found. Please sign in first to create a profile.');
        return;
    }

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
            title: "Neon Nights Music Festival",
            description: "Experience the ultimate electronic music festival with top DJs and stunning light shows.",
            location: "San Francisco, CA",
            startDate: new Date("2026-07-15T20:00:00Z"),
            endDate: new Date("2026-07-16T04:00:00Z"),
            status: "live",
            organizerId: organizer.id,
            tickets: {
                create: [
                    { type: "General Admission", price: 45.00, quantity: 100 },
                    { type: "VIP Pass", price: 120.00, quantity: 20 }
                ]
            }
        }
    });

    console.log('Created event:', event);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());

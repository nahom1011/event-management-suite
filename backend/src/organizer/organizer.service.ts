import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

export class OrganizerService {
    async applyToBecomeOrganizer(userId: string, data: { organizationName: string; phone?: string; payoutDetails?: any }) {
        // 1. Check if an application or profile already exists
        const existingProfile = await prisma.organizerProfile.findUnique({
            where: { userId },
        });

        if (existingProfile) {
            throw new AppError('You have already submitted an application or are already an organizer', 400);
        }

        // 2. Create profile with "pending" status
        return await prisma.organizerProfile.create({
            data: {
                userId,
                organizationName: data.organizationName,
                phone: data.phone,
                payoutDetails: data.payoutDetails,
                verificationStatus: 'pending',
            },
        });
    }

    async getMyProfile(userId: string) {
        const profile = await prisma.organizerProfile.findUnique({
            where: { userId },
        });

        if (!profile) {
            throw new AppError('Organizer profile not found', 404);
        }

        return profile;
    }

    async getOrganizerStats(userId: string) {
        const profile = await this.getMyProfile(userId);

        const events = await prisma.event.findMany({
            where: { organizerId: profile.id },
            include: {
                tickets: true,
                orders: {
                    where: { paymentStatus: 'completed' },
                    select: { totalAmount: true }
                }
            }
        });

        const totalEvents = events.length;
        const totalTicketsSold = events.reduce((sum: number, event: any) =>
            sum + event.orders.length, 0
        );
        const totalRevenue = events.reduce((sum: number, event: any) =>
            sum + event.orders.reduce((rev: number, order: any) => rev + Number(order.totalAmount), 0), 0
        );

        const eventStatusBreakdown = events.reduce((acc: any, event: any) => {
            acc[event.status] = (acc[event.status] || 0) + 1;
            return acc;
        }, {});

        return {
            totalEvents,
            totalTicketsSold,
            totalRevenue,
            eventStatusBreakdown,
            events: events.map((e: any) => ({
                id: e.id,
                title: e.title,
                status: e.status,
                startDate: e.startDate,
                ticketsSold: e.orders.length,
            }))
        };
    }

    async getEventAttendees(userId: string, eventId: string) {
        const profile = await this.getMyProfile(userId);

        const event = await prisma.event.findFirst({
            where: {
                id: eventId,
                organizerId: profile.id
            }
        });

        if (!event) {
            throw new AppError('Event not found or unauthorized', 404);
        }

        const orders = await prisma.order.findMany({
            where: { eventId },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                ticket: {
                    select: {
                        type: true,
                        price: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return orders;
    }
}

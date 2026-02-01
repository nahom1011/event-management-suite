import { EventStatus, Prisma } from '@prisma/client';
import { prisma } from '../utils/db';
import { AppError } from '../utils/AppError';

export class EventsService {
    async createEvent(data: {
        title: string;
        description?: string;
        location?: string;
        startDate: Date;
        endDate: Date;
        organizerId: string;
        tickets: { type: string; price: number; quantity: number }[];
    }) {
        return await prisma.event.create({
            data: {
                title: data.title,
                description: data.description,
                location: data.location,
                startDate: data.startDate,
                endDate: data.endDate,
                organizerId: data.organizerId,
                status: EventStatus.draft,
                ticketTypes: { // Changed from tickets to ticketTypes
                    create: data.tickets.map(t => ({
                        name: t.type, // Changed from type to name
                        price: new Prisma.Decimal(t.price),
                        quantity: t.quantity
                    }))
                }
            },
            include: {
                ticketTypes: true // Changed from tickets to ticketTypes
            }
        });
    }

    async getEvents(filters: { organizerId?: string; status?: EventStatus } = {}) {
        return await prisma.event.findMany({
            where: {
                ...filters,
            },
            include: {
                ticketTypes: true, // Changed from tickets to ticketTypes
            },
        });
    }

    async getEventById(id: string) {
        const event = await prisma.event.findUnique({
            where: { id },
            include: {
                ticketTypes: true, // Changed from tickets to ticketTypes
                organizer: true,
            },
        });

        if (!event) {
            throw new AppError('Event not found', 404);
        }

        return event;
    }

    async updateEvent(id: string, organizerId: string, data: Partial<{
        title: string;
        description: string;
        location: string;
        startDate: Date;
        endDate: Date;
        status: EventStatus;
    }>) {
        const event = await this.getEventById(id);

        if (event.organizerId !== organizerId) {
            throw new AppError('You are not authorized to update this event', 403);
        }

        return await prisma.event.update({
            where: { id },
            data,
            include: { ticketTypes: true } // Changed from tickets to ticketTypes
        });
    }

    async deleteEvent(id: string, organizerId: string) {
        const event = await this.getEventById(id);

        if (event.organizerId !== organizerId) {
            throw new AppError('You are not authorized to delete this event', 403);
        }

        return await prisma.event.delete({
            where: { id },
        });
    }

    async getOrganizerProfileByUserId(userId: string) {
        const profile = await prisma.organizerProfile.findUnique({
            where: { userId },
        });

        if (!profile) {
            throw new AppError('Organizer profile not found', 404);
        }

        return profile;
    }
}


import { PrismaClient, EventStatus } from '@prisma/client';
import { AppError } from '../utils/AppError';

const prisma = new PrismaClient();

export class EventsService {
    async createEvent(data: {
        title: string;
        description?: string;
        location?: string;
        startDate: Date;
        endDate: Date;
        organizerId: string;
    }) {
        return await prisma.event.create({
            data: {
                ...data,
                status: EventStatus.draft,
            },
        });
    }

    async getEvents(filters: { organizerId?: string; status?: EventStatus } = {}) {
        return await prisma.event.findMany({
            where: {
                ...filters,
            },
            include: {
                tickets: true,
            },
        });
    }

    async getEventById(id: string) {
        const event = await prisma.event.findUnique({
            where: { id },
            include: {
                tickets: true,
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
            throw new AppError('Organizer profile not found. Please register as an organizer first.', 404);
        }

        return profile;
    }
}

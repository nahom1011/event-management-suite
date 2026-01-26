import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { EventsService } from './events.service';
import { AppError } from '../utils/AppError';
import { EventStatus } from '@prisma/client';

const eventsService = new EventsService();

const eventBodySchema = z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    location: z.string().optional(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    tickets: z.array(z.object({
        type: z.string().min(1),
        price: z.number().min(0),
        quantity: z.number().int().min(1)
    })).min(1)
});

export const createEventHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const data = eventBodySchema.parse(request.body);
    const user = request.user; // Set by authenticate middleware

    if (!user) throw new AppError('Unauthorized', 401);

    const organizer = await eventsService.getOrganizerProfileByUserId(user.id);

    const event = await eventsService.createEvent({
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        organizerId: organizer.id,
    });

    return reply.code(201).send({
        status: 'success',
        data: { event },
    });
};

export const getEventsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const querySchema = z.object({
        organizerId: z.string().optional(),
        status: z.nativeEnum(EventStatus).optional(),
    });

    const filters = querySchema.parse(request.query) as { organizerId?: string; status?: EventStatus };
    const events = await eventsService.getEvents(filters);

    return reply.send({
        status: 'success',
        data: { events },
    });
};

export const getEventByIdHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const event = await eventsService.getEventById(id);

    return reply.send({
        status: 'success',
        data: { event },
    });
};

export const updateEventHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const data = eventBodySchema.partial().extend({
        status: z.nativeEnum(EventStatus).optional(),
    }).parse(request.body);

    const user = request.user;
    if (!user) throw new AppError('Unauthorized', 401);

    const organizer = await eventsService.getOrganizerProfileByUserId(user.id);

    const event = await eventsService.updateEvent(id, organizer.id, {
        title: data.title as string | undefined,
        description: data.description as string | undefined,
        location: data.location as string | undefined,
        status: data.status as EventStatus | undefined,
        startDate: data.startDate ? new Date(data.startDate as string) : undefined,
        endDate: data.endDate ? new Date(data.endDate as string) : undefined,
    });

    return reply.send({
        status: 'success',
        data: { event },
    });
};

export const deleteEventHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);

    const user = request.user;
    if (!user) throw new AppError('Unauthorized', 401);

    const organizer = await eventsService.getOrganizerProfileByUserId(user.id);

    await eventsService.deleteEvent(id, organizer.id);

    return reply.code(204).send();
};


import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { OrganizerService } from './organizer.service';
import { AppError } from '../utils/AppError';

const organizerService = new OrganizerService();

export const applyHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const applySchema = z.object({
        organizationName: z.string().min(2),
        phone: z.string().optional(),
        payoutDetails: z.any().optional(),
    });

    const data = applySchema.parse(request.body);
    const userId = request.user?.id;

    if (!userId) throw new AppError('Unauthorized', 401);

    const profile = await organizerService.applyToBecomeOrganizer(userId, data);

    return reply.code(201).send({
        status: 'success',
        data: { profile },
    });
};

export const getMyProfileHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user?.id;
    if (!userId) throw new AppError('Unauthorized', 401);

    const profile = await organizerService.getMyProfile(userId);

    return reply.send({
        status: 'success',
        data: { profile },
    });
};

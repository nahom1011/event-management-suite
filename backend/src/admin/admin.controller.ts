import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { AdminService } from './admin.service';
import { AppError } from '../utils/AppError';

const adminService = new AdminService();

export const reviewOrganizerHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const paramsSchema = z.object({
        id: z.string().uuid(),
    });
    const bodySchema = z.object({
        status: z.enum(['approved', 'rejected']),
    });

    const { id } = paramsSchema.parse(request.params);
    const { status } = bodySchema.parse(request.body);
    const adminId = request.user?.id;

    if (!adminId) throw new AppError('Unauthorized', 401);

    const profile = await adminService.reviewOrganizerApplication(adminId, id, status);

    return reply.send({
        status: 'success',
        data: { profile },
    });
};

export const getPendingApplicationsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const applications = await adminService.getPendingApplications();

    return reply.send({
        status: 'success',
        data: { applications },
    });
};

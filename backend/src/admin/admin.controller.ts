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

export const reviewEventHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const paramsSchema = z.object({
        id: z.string().uuid(),
    });
    const bodySchema = z.object({
        status: z.enum(['approved', 'live', 'cancelled']),
    });

    const { id } = paramsSchema.parse(request.params);
    const { status } = bodySchema.parse(request.body);
    const adminId = request.user?.id;

    if (!adminId) throw new AppError('Unauthorized', 401);

    const event = await adminService.reviewEvent(adminId, id, status);

    return reply.send({
        status: 'success',
        data: { event },
    });
};

export const getPendingEventsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const events = await adminService.getPendingEvents();

    return reply.send({
        status: 'success',
        data: { events },
    });
};

export const getAllUsersHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const users = await adminService.getAllUsers();

    return reply.send({
        status: 'success',
        data: { users },
    });
};

export const toggleUserActiveHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const { isActive } = z.object({ isActive: z.boolean() }).parse(request.body);
    const adminId = request.user?.id;

    if (!adminId) throw new AppError('Unauthorized', 401);

    const user = await adminService.toggleUserActive(adminId, id, isActive);

    return reply.send({
        status: 'success',
        data: { user },
    });
};

export const toggleUserBanHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const { isBanned } = z.object({ isBanned: z.boolean() }).parse(request.body);
    const adminId = request.user?.id;

    if (!adminId) throw new AppError('Unauthorized', 401);

    const user = await adminService.toggleUserBan(adminId, id, isBanned);

    return reply.send({
        status: 'success',
        data: { user },
    });
};

export const getAuditLogsHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const logs = await adminService.getAuditLogs();

    return reply.send({
        status: 'success',
        data: { logs },
    });
};

export const changeRoleHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const { role } = z.object({ role: z.string() }).parse(request.body);
    const adminId = request.user?.id;

    if (!adminId) throw new AppError('Unauthorized', 401);

    const user = await adminService.changeUserRole(adminId, id, role);

    return reply.send({
        status: 'success',
        data: { user },
    });
};

export const killSwitchHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const { maintenanceMode } = z.object({ maintenanceMode: z.boolean() }).parse(request.body);
    const adminId = request.user?.id;

    if (!adminId) throw new AppError('Unauthorized', 401);

    const status = await adminService.emergencyKillSwitch(adminId, maintenanceMode);

    return reply.send({
        status: 'success',
        data: { status },
    });
};

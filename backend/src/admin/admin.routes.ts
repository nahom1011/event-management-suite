import { FastifyInstance } from 'fastify';
import {
    reviewOrganizerHandler,
    getPendingApplicationsHandler,
    reviewEventHandler,
    getPendingEventsHandler,
    getAllUsersHandler,
    toggleUserActiveHandler,
    toggleUserBanHandler,
    getAuditLogsHandler,
    changeRoleHandler,
    killSwitchHandler
} from './admin.controller';
import { authenticate, authorize } from '../middlewares/authMiddleware';

export async function adminRoutes(server: FastifyInstance) {
    // Admin & Super Admin: Moderation
    const adminOnlyHandlers = [authenticate, authorize('admin', 'super_admin')];

    // Organizer Moderation
    server.get('/pending-organizers', {
        preHandler: adminOnlyHandlers
    }, getPendingApplicationsHandler);

    server.patch('/review-organizer/:id', {
        preHandler: adminOnlyHandlers
    }, reviewOrganizerHandler);

    // Event Moderation
    server.get('/pending-events', {
        preHandler: adminOnlyHandlers
    }, getPendingEventsHandler);

    server.patch('/review-event/:id', {
        preHandler: adminOnlyHandlers
    }, reviewEventHandler);

    // Super Admin ONLY: User Management & System
    const superAdminOnlyHandlers = [authenticate, authorize('super_admin')];

    server.get('/users', {
        preHandler: superAdminOnlyHandlers
    }, getAllUsersHandler);

    server.patch('/users/:id/active', {
        preHandler: superAdminOnlyHandlers
    }, toggleUserActiveHandler);

    server.patch('/users/:id/ban', {
        preHandler: superAdminOnlyHandlers
    }, toggleUserBanHandler);

    server.get('/audit-logs', {
        preHandler: superAdminOnlyHandlers
    }, getAuditLogsHandler);

    server.patch('/users/:id/role', {
        preHandler: superAdminOnlyHandlers
    }, changeRoleHandler);

    server.post('/emergency-kill-switch', {
        preHandler: superAdminOnlyHandlers
    }, killSwitchHandler);
}

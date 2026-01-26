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
    // Shared preHandler for all admin routes
    const adminPreHandlers = [authenticate, authorize('admin', 'super_admin')];

    // Organizer Moderation
    server.get('/pending-organizers', {
        preHandler: adminPreHandlers
    }, getPendingApplicationsHandler);

    server.patch('/review-organizer/:id', {
        preHandler: adminPreHandlers
    }, reviewOrganizerHandler);

    // Event Moderation
    server.get('/pending-events', {
        preHandler: adminPreHandlers
    }, getPendingEventsHandler);

    server.patch('/review-event/:id', {
        preHandler: adminPreHandlers
    }, reviewEventHandler);

    // User Management
    server.get('/users', {
        preHandler: adminPreHandlers
    }, getAllUsersHandler);

    server.patch('/users/:id/active', {
        preHandler: adminPreHandlers
    }, toggleUserActiveHandler);

    server.patch('/users/:id/ban', {
        preHandler: adminPreHandlers
    }, toggleUserBanHandler);

    // Super Admin Only
    const superAdminPreHandlers = [authenticate, authorize('super_admin')];

    server.get('/audit-logs', {
        preHandler: superAdminPreHandlers
    }, getAuditLogsHandler);

    server.patch('/users/:id/role', {
        preHandler: superAdminPreHandlers
    }, changeRoleHandler);

    server.post('/emergency-kill-switch', {
        preHandler: superAdminPreHandlers
    }, killSwitchHandler);
}

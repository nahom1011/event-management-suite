import { FastifyInstance } from 'fastify';
import { reviewOrganizerHandler, getPendingApplicationsHandler } from './admin.controller';
import { authenticate, authorize } from '../middlewares/authMiddleware';

export async function adminRoutes(server: FastifyInstance) {
    // Admin & Super Admin routes
    server.get('/pending-organizers', {
        preHandler: [authenticate, authorize('admin', 'super_admin')]
    }, getPendingApplicationsHandler);

    server.patch('/review-organizer/:id', {
        preHandler: [authenticate, authorize('admin', 'super_admin')]
    }, reviewOrganizerHandler);
}

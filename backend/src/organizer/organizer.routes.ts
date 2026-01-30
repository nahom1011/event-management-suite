import { FastifyInstance } from 'fastify';
import { applyHandler, getMyProfileHandler, getStatsHandler, getEventAttendeesHandler } from './organizer.controller';
import { authenticate, authorize } from '../middlewares/authMiddleware';

export async function organizerRoutes(server: FastifyInstance) {
    server.post('/apply', { preHandler: [authenticate] }, applyHandler);
    server.get('/profile', { preHandler: [authenticate] }, getMyProfileHandler);
    server.get('/stats', { preHandler: [authenticate, authorize('organizer', 'admin', 'super_admin')] }, getStatsHandler);
    server.get('/events/:id/attendees', { preHandler: [authenticate, authorize('organizer', 'admin', 'super_admin')] }, getEventAttendeesHandler);
}

import { FastifyInstance } from 'fastify';
import { applyHandler, getMyProfileHandler } from './organizer.controller';
import { authenticate } from '../middlewares/authMiddleware';

export async function organizerRoutes(server: FastifyInstance) {
    server.post('/apply', { preHandler: [authenticate] }, applyHandler);
    server.get('/profile', { preHandler: [authenticate] }, getMyProfileHandler);
}

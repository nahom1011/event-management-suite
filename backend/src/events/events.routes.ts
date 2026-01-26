import { FastifyInstance } from 'fastify';
import {
    createEventHandler,
    getEventsHandler,
    getEventByIdHandler,
    updateEventHandler,
    deleteEventHandler,
} from './events.controller';
import { authenticate, authorize } from '../middlewares/authMiddleware';

export async function eventRoutes(server: FastifyInstance) {
    // Public routes
    server.get('/', getEventsHandler);
    server.get('/:id', getEventByIdHandler);

    // Protected routes
    server.post('/', {
        preHandler: [authenticate, authorize('organizer', 'admin', 'super_admin')],
    }, createEventHandler);

    server.patch('/:id', {
        preHandler: [authenticate, authorize('organizer', 'admin', 'super_admin')],
    }, updateEventHandler);

    server.delete('/:id', {
        preHandler: [authenticate, authorize('organizer', 'admin', 'super_admin')],
    }, deleteEventHandler);
}

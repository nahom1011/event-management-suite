import { FastifyInstance } from 'fastify';
import { createOrderHandler, getMyOrdersHandler } from './orders.controller';
import { authenticate } from '../middlewares/authMiddleware';

export async function ordersRoutes(server: FastifyInstance) {
    server.post('/', { preHandler: [authenticate] }, createOrderHandler);
    server.get('/me', { preHandler: [authenticate] }, getMyOrdersHandler);
}

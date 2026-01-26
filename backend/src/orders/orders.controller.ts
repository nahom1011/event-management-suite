import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { OrdersService } from './orders.service';
import { AppError } from '../utils/AppError';

const ordersService = new OrdersService();

export const createOrderHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const orderSchema = z.object({
        eventId: z.string().uuid(),
        ticketId: z.string().uuid(),
    });

    const { eventId, ticketId } = orderSchema.parse(request.body);
    const userId = request.user?.id;

    if (!userId) throw new AppError('Unauthorized', 401);

    const order = await ordersService.createOrder(userId, eventId, ticketId);

    return reply.code(201).send({
        status: 'success',
        data: { order },
    });
};

export const getMyOrdersHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user?.id;

    if (!userId) throw new AppError('Unauthorized', 401);

    const orders = await ordersService.getOrdersByUserId(userId);

    return reply.send({
        status: 'success',
        data: { orders },
    });
};

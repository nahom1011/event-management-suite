import { PrismaClient, PaymentStatus } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export class OrdersService {
    async createOrder(userId: string, eventId: string, ticketId: string) {
        // 1. Verify event and ticket exist
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { tickets: { where: { id: ticketId } } },
        });

        if (!event) throw new AppError('Event not found', 404);
        const ticket = event.tickets[0];
        if (!ticket) throw new AppError('Ticket type not found for this event', 404);

        // 2. Check availability
        if (ticket.quantity <= 0) {
            throw new AppError('Tickets are sold out', 400);
        }

        // 3. Create order in a transaction
        return await prisma.$transaction(async (tx) => {
            // Decrement ticket quantity
            await tx.ticket.update({
                where: { id: ticketId },
                data: { quantity: { decrement: 1 } },
            });

            // Create order
            const order = await tx.order.create({
                data: {
                    userId,
                    eventId,
                    ticketId,
                    totalAmount: ticket.price,
                    paymentStatus: PaymentStatus.completed, // Mocking successful payment
                    qrCode: `EVENT-${eventId}-TKT-${uuidv4().split('-')[0].toUpperCase()}`,
                },
                include: {
                    event: true,
                    ticket: true,
                }
            });

            return order;
        });
    }

    async getOrdersByUserId(userId: string) {
        return await prisma.order.findMany({
            where: { userId },
            include: {
                event: {
                    select: {
                        title: true,
                        startDate: true,
                        location: true,
                    }
                },
                ticket: {
                    select: {
                        type: true,
                        price: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}

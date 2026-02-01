import { PrismaClient, PaymentStatus } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../utils/db'; // Use singleton

export class OrdersService {
    async createOrder(userId: string, eventId: string, ticketTypeId: string) {
        // 1. Verify event and ticket exist
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: { ticketTypes: { where: { id: ticketTypeId } } },
        });

        if (!event) throw new AppError('Event not found', 404);
        const ticketType = event.ticketTypes[0];
        if (!ticketType) throw new AppError('Ticket type not found for this event', 404);

        // 2. Check availability
        if (ticketType.quantity <= ticketType.sold) {
            throw new AppError('Tickets are sold out', 400);
        }

        // 3. Create order in a transaction
        return await prisma.$transaction(async (tx) => {
            // Increment ticket sold count
            await tx.ticketType.update({
                where: { id: ticketTypeId },
                data: { sold: { increment: 1 } },
            });

            // Create order
            const order = await tx.order.create({
                data: {
                    userId,
                    eventId,
                    ticketTypeId,
                    amount: ticketType.price,
                    currency: ticketType.currency,
                    status: 'PAID', // Mocking successful payment
                    stripeSessionId: `MOCK-${uuidv4()}`,
                },
                include: {
                    event: true,
                    ticketType: true,
                    tickets: true
                }
            });

            // Create Ticket
            await tx.ticket.create({
                data: {
                    orderId: order.id,
                    ticketTypeId,
                    eventId,
                    userId,
                    code: `MOCK-${uuidv4().substring(0, 8)}`,
                    status: 'ACTIVE'
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
                ticketType: {
                    select: {
                        name: true,
                        price: true,
                    }
                },
                tickets: {
                    select: {
                        code: true,
                        qrCode: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}

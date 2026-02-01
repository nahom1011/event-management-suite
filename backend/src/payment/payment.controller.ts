import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../utils/db';
import { StripeService } from './stripe.service';
import { AppError } from '../utils/AppError';
import { z } from 'zod';

const checkoutSchema = z.object({
    eventId: z.string().uuid(),
    ticketTypeId: z.string().uuid(),
    quantity: z.number().int().positive(),
});

export class PaymentController {
    static async checkout(request: FastifyRequest, reply: FastifyReply) {
        const user = (request as any).user;
        if (!user) {
            throw new AppError('Unauthorized', 401);
        }

        const { eventId, ticketTypeId, quantity } = checkoutSchema.parse(request.body);

        // 1. Validate Event and TicketType
        const ticketType = await prisma.ticketType.findUnique({
            where: { id: ticketTypeId },
            include: { event: true },
        });

        if (!ticketType) {
            throw new AppError('Ticket type not found', 404);
        }

        if (ticketType.eventId !== eventId) {
            throw new AppError('Ticket type does not belong to this event', 400);
        }

        if (ticketType.status !== 'AVAILABLE' || ticketType.quantity < ticketType.sold + quantity) {
            throw new AppError('Tickets unavailable or sold out', 400);
        }

        // 2. Create Order (PENDING)
        const amount = Number(ticketType.price) * quantity * 100; // in cents
        const order = await prisma.order.create({
            data: {
                userId: user.id,
                eventId,
                ticketTypeId,
                amount: Number(ticketType.price) * quantity, // stored in decimal main currency unit in DB, but passed as cents to Stripe
                quantity,
                currency: 'usd',
                status: 'PENDING',
            },
        });

        // 3. Create Stripe Session
        try {
            const session = await StripeService.createCheckoutSession(
                user.id,
                user.email || 'customer@example.com', // fallback if email missing in token, but it should be there or fetched
                eventId,
                ticketTypeId,
                amount,
                'usd',
                quantity
            );

            // 4. Update Order with Session ID
            await prisma.order.update({
                where: { id: order.id },
                data: { stripeSessionId: session.id },
            });

            return { url: session.url };
        } catch (error) {
            // If payment initiation fails, we might want to fail the order or leave it pending
            throw new AppError('Payment initiation failed', 500);
        }
    }

    static async webhook(request: FastifyRequest, reply: FastifyReply) {
        const signature = request.headers['stripe-signature'] as string;

        // NOTE: request.rawBody requires fastify-raw-body plugin
        const rawBody = (request as any).rawBody;

        let event;
        try {
            event = await StripeService.constructWebhookEvent(rawBody, signature);
        } catch (err: any) {
            console.error(`Webhook signature verification failed: ${err.message}`);
            return reply.code(400).send(`Webhook Error: ${err.message}`);
        }

        // Handle events
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as any;
            const orderId = session.metadata?.orderId; // We didn't pass orderId in metadata in service, we passed userId, eventId, ticketTypeId.
            // But we saved session.id in Order. So we can find order by session.id.

            const order = await prisma.order.findUnique({
                where: { stripeSessionId: session.id },
            });

            if (order) {
                await prisma.$transaction(async (tx) => {
                    // 1. Update Order Status
                    await tx.order.update({
                        where: { id: order.id },
                        data: { status: 'PAID' },
                    });

                    // 2. Increment Ticket Sales
                    await tx.ticketType.update({
                        where: { id: order.ticketTypeId },
                        data: { sold: { increment: order.quantity } },
                    });

                    // 3. Generate Tickets
                    // Loop and create 'quantity' tickets
                    for (let i = 0; i < order.quantity; i++) {
                        await tx.ticket.create({
                            data: {
                                orderId: order.id,
                                ticketTypeId: order.ticketTypeId,
                                eventId: order.eventId,
                                userId: order.userId,
                                code: `${order.eventId.slice(0, 4)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                                status: 'ACTIVE',
                            },
                        });
                    }
                });
                console.log(`Order ${order.id} fulfilled.`);
            } else {
                console.warn(`Order not found for session ${session.id}`);
            }
        }

        return { received: true };
    }
}

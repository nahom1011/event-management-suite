import { FastifyInstance } from 'fastify';
import { PaymentController } from './payment.controller';
import { authenticate } from '../middlewares/authMiddleware';

export async function paymentRoutes(fastify: FastifyInstance) {
    // Public webhook route (must be raw body)
    fastify.post('/webhook', {
        config: { rawBody: true }, // Ensure raw body is preserved for this route if plugin allows config
    },
        PaymentController.webhook
    );

    // Protected checkout route
    fastify.post('/checkout', {
        preHandler: [authenticate],
    }, PaymentController.checkout);
}

import { FastifyInstance } from 'fastify';
import { PaymentController } from './payment.controller';
import { authenticate } from '../middlewares/authMiddleware';

export async function paymentRoutes(fastify: FastifyInstance) {
    // Webhook route - optional, requires fastify-raw-body plugin for production use
    // Currently disabled since we're using session verification instead
    // fastify.post('/webhook', {
    //     config: { rawBody: true },
    // }, PaymentController.webhook);

    // Protected checkout route
    fastify.post('/checkout', {
        preHandler: [authenticate],
    }, PaymentController.checkout);

    // Verify payment session (alternative to webhooks for local development)
    fastify.get('/verify-session/:sessionId', {
        preHandler: [authenticate],
    }, PaymentController.verifySession);
}

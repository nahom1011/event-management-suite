import fastify from 'fastify';
import dotenv from 'dotenv';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import { authRoutes } from './auth/auth.routes';
import { eventRoutes } from './events/events.routes';
import { ordersRoutes } from './orders/orders.routes';

dotenv.config();

const server = fastify({
    logger: true,
});

// Register Plugins
server.register(cookie);
server.register(cors, {
    origin: ['http://localhost:5173'],
    credentials: true,
});

// Health Check
server.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
});

// Register Routes
server.register(authRoutes, { prefix: '/api/v1/auth' });
server.register(eventRoutes, { prefix: '/api/v1/events' });
server.register(ordersRoutes, { prefix: '/api/v1/orders' });

const start = async () => {
    try {
        const port = parseInt(process.env.PORT || '3000');
        await server.listen({ port, host: '0.0.0.0' });
        console.log(`Server listening on port ${port}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();

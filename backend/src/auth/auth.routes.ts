import { FastifyInstance } from 'fastify';
import { loginHandler, logoutHandler, refreshTokensHandler } from './auth.controller';

export async function authRoutes(server: FastifyInstance) {
    server.post('/login', loginHandler);
    server.post('/refresh', refreshTokensHandler);
    server.post('/logout', logoutHandler);
}

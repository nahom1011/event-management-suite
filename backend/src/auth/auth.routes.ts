import { FastifyInstance } from 'fastify';
import { loginHandler, logoutHandler, refreshTokensHandler, registerHandler, resendVerificationHandler, verifyEmailHandler } from './auth.controller';

export async function authRoutes(server: FastifyInstance) {
    server.post('/register', registerHandler);
    server.post('/login', loginHandler);
    server.post('/refresh', refreshTokensHandler);
    server.post('/logout', logoutHandler);
    server.get('/verify-email', verifyEmailHandler);
    server.post('/resend-verification', resendVerificationHandler);
}

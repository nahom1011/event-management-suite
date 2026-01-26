import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { AuthService } from './auth.service';
import { AppError } from '../utils/AppError';
import '@fastify/cookie';

const authService = new AuthService();

export const loginHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const loginSchema = z.object({
        idToken: z.string().min(1, 'Google ID Token is required'),
    });

    const { idToken } = loginSchema.parse(request.body);

    const { user, tokens } = await authService.loginWithGoogle(idToken);

    // Set refresh token in HTTP-only cookie
    reply.setCookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api/v1/auth/refresh',
        maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return reply.send({
        status: 'success',
        data: {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar,
            },
            accessToken: tokens.accessToken,
        },
    });
};

export const refreshTokensHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = request.cookies.refreshToken;

    if (!refreshToken) {
        throw new AppError('Refresh token not found', 401);
    }

    const user = await authService.verifyRefreshToken(refreshToken);
    const tokens = authService.generateTokens(user.id, user.role);

    reply.setCookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api/v1/auth/refresh',
        maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return reply.send({
        status: 'success',
        data: {
            accessToken: tokens.accessToken,
        },
    });
};

export const logoutHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    reply.clearCookie('refreshToken', {
        path: '/api/v1/auth/refresh',
    });

    return reply.send({
        status: 'success',
        message: 'Logged out successfully',
    });
};

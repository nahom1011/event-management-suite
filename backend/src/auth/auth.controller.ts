import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { AuthService } from './auth.service';
import { AppError } from '../utils/AppError';
import '@fastify/cookie';

const authService = new AuthService();

export const registerHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const registerSchema = z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        name: z.string().min(1, 'Name is required'),
    });

    const { email, password, name } = registerSchema.parse(request.body);

    const { user, tokens } = await authService.register({ email, password, name });

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

export const loginHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const loginSchema = z.object({
        email: z.string().email().optional(),
        password: z.string().optional(),
        idToken: z.string().optional(),
    }).refine(data => data.idToken || (data.email && data.password), {
        message: "Either idToken (Google) or email and password must be provided",
    });

    const { email, password, idToken } = loginSchema.parse(request.body);

    let result;
    if (idToken) {
        result = await authService.loginWithGoogle(idToken);
    } else if (email && password) {
        result = await authService.login(email, password);
    } else {
        throw new AppError('Invalid login credentials', 400);
    }

    const { user, tokens } = result;

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

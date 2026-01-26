import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

interface JWTPayload {
    userId: string;
    role: string;
}

declare module 'fastify' {
    interface FastifyRequest {
        user?: {
            id: string;
            role: string;
        };
    }
}

export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('Authentication required', 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;

        request.user = {
            id: decoded.userId,
            role: decoded.role,
        };
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            throw new AppError('Invalid or expired token', 401);
        }
        throw error;
    }
};

export const authorize = (...roles: string[]) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        if (!request.user) {
            throw new AppError('Authentication required', 401);
        }

        if (!roles.includes(request.user.role)) {
            throw new AppError('You do not have permission to perform this action', 403);
        }
    };
};

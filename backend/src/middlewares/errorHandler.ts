import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../utils/AppError';
import { ZodError } from 'zod';

export const globalErrorHandler = (
    error: FastifyError,
    request: FastifyRequest,
    reply: FastifyReply
) => {
    if (error instanceof AppError) {
        return reply.status(error.statusCode).send({
            status: 'error',
            message: error.message,
        });
    }

    if (error instanceof ZodError) {
        return reply.status(400).send({
            status: 'fail',
            message: 'Validation error',
            errors: error.flatten(),
        });
    }

    request.log.error(error);

    reply.status(500).send({
        status: 'error',
        message: 'Internal Server Error',
    });
};

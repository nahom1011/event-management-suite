import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

interface GoogleUser {
    email: string;
    name: string;
    picture?: string;
}

export class AuthService {
    async verifyGoogleToken(idToken: string): Promise<GoogleUser> {
        try {
            const ticket = await client.verifyIdToken({
                idToken,
                audience: env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();

            if (!payload || !payload.email) {
                throw new AppError('Invalid Google Token payload', 400);
            }

            return {
                email: payload.email,
                name: payload.name || 'Unknown',
                picture: payload.picture,
            };
        } catch (error) {
            throw new AppError('Google authentication failed', 401);
        }
    }

    generateTokens(userId: string, role: string) {
        const accessToken = jwt.sign(
            { userId, role },
            env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { userId },
            env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        return { accessToken, refreshToken };
    }

    async register(data: { email: string; password?: string; name: string; avatar?: string }) {
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new AppError('User with this email already exists', 400);
        }

        let hashedPassword = undefined;
        if (data.password) {
            hashedPassword = await bcrypt.hash(data.password, 12);
        }

        const user = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
                avatar: data.avatar,
                role: 'user',
            },
        });

        const tokens = this.generateTokens(user.id, user.role);
        return { user, tokens };
    }

    async login(email: string, password?: string) {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new AppError('Invalid email or password', 401);
        }

        if (user.isBanned) {
            throw new AppError('User is banned', 403);
        }

        if (password) {
            if (!user.password) {
                throw new AppError('This account uses Google Login. Please sign in with Google.', 401);
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new AppError('Invalid email or password', 401);
            }
        }

        const tokens = this.generateTokens(user.id, user.role);
        return { user, tokens };
    }

    async loginWithGoogle(idToken: string) {
        const googleUser = await this.verifyGoogleToken(idToken);

        let user = await prisma.user.findUnique({
            where: { email: googleUser.email },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: googleUser.email,
                    name: googleUser.name,
                    avatar: googleUser.picture,
                    role: 'user', // Default role
                },
            });
        }

        if (user.isBanned) {
            throw new AppError('User is banned', 403);
        }

        const tokens = this.generateTokens(user.id, user.role);
        return { user, tokens };
    }

    async verifyRefreshToken(token: string) {
        try {
            const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };
            const user = await prisma.user.findUnique({
                where: { id: payload.userId },
            });

            if (!user || user.isBanned || !user.isActive) {
                throw new AppError('Invalid or inactive user', 401);
            }

            return user;
        } catch (error) {
            throw new AppError('Invalid refresh token', 401);
        }
    }
}

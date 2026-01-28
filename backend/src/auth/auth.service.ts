import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { PrismaClient } from '@prisma/client';
import { MailService } from '../utils/mail.service';

const prisma = new PrismaClient();
const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);
const mailService = new MailService();

interface GoogleUser {
    email: string;
    name: string;
    picture?: string;
}

export class AuthService {
    private hashToken(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex');
    }

    async generateVerificationToken(userId: string): Promise<string> {
        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = this.hashToken(token);
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await prisma.emailVerificationToken.upsert({
            where: { userId },
            update: {
                tokenHash,
                expiresAt,
                createdAt: new Date(),
            },
            create: {
                userId,
                tokenHash,
                expiresAt,
            },
        });

        return token;
    }

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
        console.log('Registering user:', data.email);
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
                emailVerified: false,
                status: 'PENDING',
            },
        });

        const token = await this.generateVerificationToken(user.id);

        try {
            await mailService.sendVerificationEmail(user.email, token);
        } catch (error) {
            console.error('Failed to send verification email:', error);
            // We don't throw here to allow the user record to persist, they can resend later
        }

        return { user };
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

        if (!user.emailVerified) {
            throw new AppError('Please verify your email before signing in.', 403);
        }

        if (user.status !== 'ACTIVE') {
            throw new AppError(`Your account is ${user.status.toLowerCase()}`, 403);
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
                    emailVerified: true, // Google emails are pre-verified
                    status: 'ACTIVE',
                },
            });
        }

        if (user.isBanned) {
            throw new AppError('User is banned', 403);
        }

        if (!user.emailVerified) {
            throw new AppError('Please verify your email before signing in.', 403);
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

            if (!user || user.isBanned || !user.isActive || !user.emailVerified || user.status !== 'ACTIVE') {
                throw new AppError('Invalid or inactive user', 401);
            }

            return user;
        } catch (error) {
            throw new AppError('Invalid refresh token', 401);
        }
    }

    async verifyEmail(token: string) {
        const tokenHash = this.hashToken(token);

        const verificationToken = await prisma.emailVerificationToken.findFirst({
            where: {
                tokenHash,
                expiresAt: { gt: new Date() }
            },
            include: { user: true }
        });

        if (!verificationToken) {
            throw new AppError('Invalid or expired verification token', 400);
        }

        await prisma.$transaction([
            prisma.user.update({
                where: { id: verificationToken.userId },
                data: {
                    emailVerified: true,
                    status: 'ACTIVE'
                }
            }),
            prisma.emailVerificationToken.delete({
                where: { id: verificationToken.id }
            })
        ]);

        return { message: 'Email verified successfully' };
    }

    async resendVerification(email: string) {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        if (user.emailVerified) {
            throw new AppError('Email is already verified', 400);
        }

        const token = await this.generateVerificationToken(user.id);
        await mailService.sendVerificationEmail(user.email, token);

        return { message: 'Verification email sent' };
    }
}

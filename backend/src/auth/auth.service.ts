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
    email_verified?: boolean;
}

export class AuthService {
    // ... (keep hashToken and generateVerificationToken as is)

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
            console.log('Verifying Google Token with Client ID:', env.GOOGLE_CLIENT_ID.substring(0, 10) + '...');
            console.log('Token (truncated):', idToken.substring(0, 20) + '...');

            const ticket = await client.verifyIdToken({
                idToken,
                audience: env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();

            console.log('Google Payload:', JSON.stringify(payload, null, 2));

            if (!payload || !payload.email) {
                throw new AppError('Invalid Google Token payload', 400);
            }

            return {
                email: payload.email,
                name: payload.name || 'Unknown',
                picture: payload.picture,
                email_verified: payload.email_verified,
            };
        } catch (error: any) {
            console.error('Google verification error details:', {
                message: error.message,
                stack: error.stack,
                // Log full error object if it has other properties like 'response'
                ...error
            });
            throw new AppError('Google authentication failed: ' + error.message, 401);
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
        } else {
            // User exists - check if verified
            // If the user exists but isn't verified, AND Google says the email is indeed verified,
            // we should trust Google and verify the local user.
            if (!user.emailVerified && googleUser.email_verified) {
                console.log(`Auto-verifying user ${user.email} based on trusted Google Sign-In.`);
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        emailVerified: true,
                        status: 'ACTIVE'
                    }
                });
            }
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

    async verifyEmail(token: string, email?: string) {
        const tokenHash = this.hashToken(token);

        const verificationToken = await prisma.emailVerificationToken.findFirst({
            where: {
                tokenHash,
                expiresAt: { gt: new Date() }
            },
            include: { user: true }
        });

        if (!verificationToken) {
            // Token not found or expired - check if user is already verified via email parameter
            if (email) {
                const user = await prisma.user.findUnique({
                    where: { email }
                });

                if (user?.emailVerified) {
                    return { message: 'Email already verified', alreadyVerified: true };
                }
            }

            // Fallback: check if ANY token with this hash existed (security note: this is less efficient 
            // but helps if token exists but is expired, or if we want to find the user from the hash)
            const anyToken = await prisma.emailVerificationToken.findFirst({
                where: { tokenHash },
                include: { user: true }
            });

            if (anyToken?.user) {
                if (anyToken.user.emailVerified) {
                    return { message: 'Email already verified', alreadyVerified: true };
                }
                throw new AppError('Verification link has expired. Please request a new one.', 400);
            }

            throw new AppError('Invalid verification link', 400);
        }

        // Check if user is already verified (token still exists but user already verified)
        if (verificationToken.user.emailVerified) {
            return { message: 'Email already verified', alreadyVerified: true };
        }

        // Verify the user
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

        return { message: 'Email verified successfully', alreadyVerified: false };
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

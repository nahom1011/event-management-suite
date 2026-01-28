import nodemailer from 'nodemailer';
import { env } from '../config/env';

export class MailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: env.EMAIL_HOST,
            port: Number(env.EMAIL_PORT),
            secure: Number(env.EMAIL_PORT) === 465,
            auth: env.EMAIL_USER ? {
                user: env.EMAIL_USER,
                pass: env.EMAIL_PASS,
            } : undefined,
        });
    }

    async sendVerificationEmail(email: string, token: string) {
        const verificationLink = `${env.FRONTEND_URL}/verify-email?token=${token}`;

        await this.transporter.sendMail({
            from: '"Event Management" <noreply@eventsuite.com>',
            to: email,
            subject: 'Verify your email',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1>Verify your email</h1>
                    <p>Click the button below to verify your email address. This link will expire in 1 hour.</p>
                    <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">Verify Email</a>
                    <p>Or copy and paste this link into your browser:</p>
                    <p>${verificationLink}</p>
                    <hr />
                    <p style="font-size: 0.8em; color: #666;">If you didn't create an account, you can safely ignore this email.</p>
                </div>
            `,
        });
    }
}

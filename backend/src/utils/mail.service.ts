import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';
import { env } from '../config/env';

export class MailService {
    private transporter?: nodemailer.Transporter;
    private useSmtp: boolean;

    constructor() {
        // Determine which email service to use
        if (env.EMAIL_HOST && env.EMAIL_PORT) {
            // Use SMTP (Gmail, etc.)
            this.useSmtp = true;
            this.transporter = nodemailer.createTransport({
                host: env.EMAIL_HOST,
                port: Number(env.EMAIL_PORT),
                secure: Number(env.EMAIL_PORT) === 465,
                auth: env.EMAIL_USER && env.EMAIL_PASS ? {
                    user: env.EMAIL_USER,
                    pass: env.EMAIL_PASS,
                } : undefined,
            });
            console.log(`✅ SMTP email service initialized (${env.EMAIL_HOST}:${env.EMAIL_PORT})`);
        } else if (env.SENDGRID_API_KEY) {
            // Use SendGrid
            this.useSmtp = false;
            sgMail.setApiKey(env.SENDGRID_API_KEY);
            console.log('✅ SendGrid email service initialized');
        } else {
            this.useSmtp = false;
            console.warn('⚠️  No email service configured - emails will not be sent');
            console.warn('   Configure either SMTP (EMAIL_HOST, EMAIL_PORT) or SendGrid (SENDGRID_API_KEY)');
        }
    }

    async sendVerificationEmail(email: string, token: string) {
        const verificationLink = `${env.FRONTEND_URL}/verify-email?token=${token}&email=${email}`;

        const emailHtml = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Event Management Suite! 🎉</h1>
                </div>
                
                <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                    <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 20px;">
                        Thank you for signing up! We're excited to have you on board.
                    </p>
                    
                    <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 30px;">
                        To complete your registration and start managing events, please verify your email address by clicking the button below:
                    </p>
                    
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${verificationLink}" 
                           style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                            Verify Email Address
                        </a>
                    </div>
                    
                    <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin-top: 30px;">
                        Or copy and paste this link into your browser:
                    </p>
                    <p style="font-size: 13px; color: #667eea; word-break: break-all; background: #f9fafb; padding: 12px; border-radius: 4px; border: 1px solid #e5e7eb;">
                        ${verificationLink}
                    </p>
                    
                    <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                        <p style="font-size: 13px; color: #9ca3af; line-height: 1.6; margin: 0;">
                            ⏱️ This verification link will expire in <strong>1 hour</strong>.
                        </p>
                        <p style="font-size: 13px; color: #9ca3af; line-height: 1.6; margin-top: 10px;">
                            If you didn't create an account with Event Management Suite, you can safely ignore this email.
                        </p>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 20px; padding: 20px;">
                    <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                        © ${new Date().getFullYear()} Event Management Suite. All rights reserved.
                    </p>
                </div>
            </div>
        `;

        const emailText = `
Welcome to Event Management Suite!

Thank you for signing up! To complete your registration, please verify your email address by clicking the link below:

${verificationLink}

This link will expire in 1 hour.

If you didn't create an account, you can safely ignore this email.

© ${new Date().getFullYear()} Event Management Suite
        `.trim();

        try {
            if (this.useSmtp && this.transporter) {
                // Send via SMTP (Gmail, etc.)
                await this.transporter.sendMail({
                    from: `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM}>`,
                    to: email,
                    subject: 'Verify your email - Event Management Suite',
                    html: emailHtml,
                    text: emailText,
                });
                console.log(`✅ Verification email sent via SMTP to ${email}`);
            } else if (env.SENDGRID_API_KEY) {
                // Send via SendGrid
                await sgMail.send({
                    to: email,
                    from: {
                        email: env.EMAIL_FROM,
                        name: env.EMAIL_FROM_NAME || 'Event Management Suite'
                    },
                    subject: 'Verify your email - Event Management Suite',
                    html: emailHtml,
                    text: emailText
                });
                console.log(`✅ Verification email sent via SendGrid to ${email}`);
            } else {
                throw new Error('No email service configured');
            }
        } catch (error: any) {
            console.error('❌ Failed to send verification email:', {
                email,
                error: error.message,
                code: error.code,
                response: error.response?.body || error.responseCode
            });
            throw new Error(`Failed to send verification email: ${error.message}`);
        }
    }
}

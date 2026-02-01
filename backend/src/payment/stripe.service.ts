import Stripe from 'stripe';
import { env } from '../config/env';

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-01-28.clover',
    typescript: true,
});

export class StripeService {
    static async createCheckoutSession(
        userId: string,
        email: string,
        eventId: string,
        ticketTypeId: string,
        amount: number, // in cents
        currency: string = 'usd',
        quantity: number = 1
    ) {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            customer_email: email,
            line_items: [
                {
                    price_data: {
                        currency: currency,
                        product_data: {
                            name: 'Event Ticket', // You might want to pass the event title or ticket type name here
                            metadata: {
                                eventId,
                                ticketTypeId,
                            },
                        },
                        unit_amount: Math.round(amount),
                    },
                    quantity: quantity,
                },
            ],
            metadata: {
                userId,
                eventId,
                ticketTypeId,
            },
            success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
        });

        return session;
    }

    static async constructWebhookEvent(payload: string | Buffer, signature: string) {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            throw new Error('STRIPE_WEBHOOK_SECRET is missing');
        }
        return stripe.webhooks.constructEvent(
            payload,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    }

    /**
     * Retrieve a checkout session by ID
     */
    static async retrieveSession(sessionId: string) {
        return await stripe.checkout.sessions.retrieve(sessionId);
    }

    /**
     * Verify session payment status and complete order
     */
    static async verifySessionPayment(sessionId: string): Promise<{
        paid: boolean;
        metadata: {
            userId: string;
            eventId: string;
            ticketTypeId: string;
        } | null;
    }> {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        return {
            paid: session.payment_status === 'paid',
            metadata: session.metadata ? {
                userId: session.metadata.userId,
                eventId: session.metadata.eventId,
                ticketTypeId: session.metadata.ticketTypeId,
            } : null,
        };
    }
}

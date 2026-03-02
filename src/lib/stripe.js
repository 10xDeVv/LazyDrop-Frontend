import Stripe from 'stripe';

// export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
//     apiVersion: '2023-10-16',
// });

export const PLANS = {
    FREE: {
        name: 'Free',
        price: 0,
        priceId: null,
        features: {
            maxFileSize: 100 * 1024 * 1024, // 100MB
            sessionDuration: 10 * 60, // 10 minutes
            transferHistory: false,
            passwordProtection: false,
            prioritySpeed: false,
        },
    },
    PLUS: {
        name: 'Plus',
        price: 4.99,
        priceId: process.env.STRIPE_PLUS_PRICE_ID, // You'll create this in Stripe Dashboard
        features: {
            maxFileSize: 2 * 1024 * 1024 * 1024, // 2GB
            sessionDuration: 120 * 60, // 2 hours
            transferHistory: true,
            passwordProtection: true,
            prioritySpeed: true,
        },
    },
    PRO: {
        name: 'PRO',
        price: 4.99,
        priceId: process.env.STRIPE_PRO_PRICE_ID, // You'll create this in Stripe Dashboard
        features: {
            maxFileSize: 2 * 1024 * 1024 * 1024, // 2GB
            sessionDuration: 120 * 60, // 2 hours
            transferHistory: true,
            passwordProtection: true,
            prioritySpeed: true,
        },
    },
};
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
            sessionDuration: 120 * 60, // 120 minutes
            maxFilesPerSession: 5,
            transferHistory: true,
            passwordProtection: false,
            prioritySpeed: false,
        },
    },
    PLUS: {
        name: 'Plus',
        price: 9.99,
        priceId: process.env.STRIPE_PLUS_PRICE_ID,
        features: {
            maxFileSize: 1024 * 1024 * 1024, // 1GB
            sessionDuration: 120 * 60, // 120 minutes
            maxFilesPerSession: 50,
            transferHistory: true,
            passwordProtection: true,
            prioritySpeed: true,
        },
    },
    PRO: {
        name: 'Pro',
        price: 19.99,
        priceId: process.env.STRIPE_PRO_PRICE_ID,
        features: {
            maxFileSize: 2 * 1024 * 1024 * 1024, // 2GB
            sessionDuration: 120 * 60, // 120 minutes
            maxFilesPerSession: 75,
            transferHistory: true,
            passwordProtection: true,
            prioritySpeed: true,
        },
    },
};
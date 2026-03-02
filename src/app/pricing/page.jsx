"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { api, ApiError } from "@/lib/api";
import Navbar from "@/components/Navbar";
import PricingCard from "@/components/PricingCard";
import { Space_Grotesk, Inter } from "next/font/google";
import { Zap, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const heading = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });
const body = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });

const TOKENS = {
    bg: "#0E0F12",
    text: "#F5F5F5",
    muted: "#9CA3AF",
    lime: "#DFFF00",
};

// Normalize backend plan codes to UI keys
const normalizePlanCode = (p) => {
    const x = String(p || "").toUpperCase();
    if (x === "PRO") return "PRO";
    if (x === "PLUS") return "PLUS";
    return "FREE";
};

export default function PricingPage() {
    const router = useRouter();
    const supabase = createClient();

    const [loadingPlan, setLoadingPlan] = useState(null);
    const [currentPlanCode, setCurrentPlanCode] = useState(null); // null = Guest, otherwise FREE/PLUS/PRO
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                setIsLoggedIn(false);
                setCurrentPlanCode(null); // Explicitly null for guest
                return;
            }

            setIsLoggedIn(true);

            try {
                const sub = await api.getMySubscription();
                setCurrentPlanCode(normalizePlanCode(sub?.planCode));
            } catch {
                // If fetching sub fails but we have a session, assume Free tier
                setCurrentPlanCode("FREE");
            }
        };

        init();
    }, []);

    const handleCheckout = async (planType) => {
        // If guest tries to click a paid plan, send to signup
        if (!isLoggedIn) {
            router.push(`/signup?redirect=${encodeURIComponent("/pricing")}`);
            return;
        }

        setLoadingPlan(planType);
        try {
            const { url } = await api.createCheckoutSession(planType);
            window.location.href = url;
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                router.push(`/signup?redirect=${encodeURIComponent("/pricing")}`);
                return;
            }
            alert(err?.message || "Something went wrong.");
        } finally {
            setLoadingPlan(null);
        }
    };

    const handleFreeAction = () => {
        if (isLoggedIn) {
            // Already have an account? Go drop.
            router.push("/drop");
        } else {
            // Guest? Create the account.
            router.push("/signup");
        }
    };

    const plans = [
        {
            name: "Free", // Renamed from Casual
            planKey: "FREE",
            price: "0",
            description: "Free with account.",
            features: [
                "100 MB per file limit",
                "15 min Session Duration",
                "5 Files per Session",
                "Standard Speed",
                "Transfer History", // Key differentiator from Guest
            ],
            // Dynamic CTA based on Auth state
            cta: isLoggedIn ? "Start Dropping" : "Create Free Account",
            onClick: handleFreeAction,
            popular: false,
        },
        {
            name: "Plus",
            planKey: "PLUS",
            price: "9.99",
            description: "More power, more time.",
            features: [
                "1 GB per file limit",
                "60 min Session Duration",
                "50 Files per Session",
                "Priority Speed",
                "Password Protection",
            ],
            cta: "Get Plus",
            onClick: () => handleCheckout("PLUS"),
            popular: true,
        },
        {
            name: "Pro",
            planKey: "PRO",
            price: "19.99",
            description: "For heavy duty transfer.",
            features: [
                "2 GB per file limit",
                "120 min Session Duration",
                "75 Files per Session",
                "Turbo Speed",
                "2000 Note History",
            ],
            cta: "Go Pro",
            onClick: () => handleCheckout("PRO"),
            popular: false,
        },
    ];

    return (
        <div className={`${body.className} min-h-screen flex flex-col`} style={{ background: TOKENS.bg, color: TOKENS.text }}>
            <Navbar />

            <main className="flex-1 pt-32 pb-24 overflow-hidden relative">

                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#DFFF00]/5 rounded-full blur-[120px] pointer-events-none -z-10" />

                <div className="max-w-[1280px] mx-auto px-4 sm:px-8 lg:px-10">

                    {/* Header */}
                    <div className="text-center mb-10 max-w-3xl mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"
                        >
                            <Zap size={16} className="text-[#DFFF00]" />
                            <span className="text-sm text-gray-400">Upgrade your workflow</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className={`${heading.className} text-4xl md:text-5xl lg:text-6xl font-bold mb-6`}
                        >
                            Simple Pricing.
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-gray-400"
                        >
                            Start free, upgrade when you need more. Cancel anytime.
                        </motion.p>
                    </div>

                    {/* Guest Limitations Callout - The "No Account" Section */}
                    {!isLoggedIn && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="max-w-2xl mx-auto text-center mb-12"
                        >
                            <div className="inline-block p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    <span className="text-white font-bold flex items-center justify-center gap-2 mb-1">
                                        <AlertCircle size={14} className="text-[#DFFF00]" /> No account? No problem.
                                    </span>
                                    You can still drop instantly as a Guest. <br className="hidden sm:block" />
                                    Guest limits: 25MB file size, 10 min expiry, 1 active session.
                                    <Link href="/drop" className="ml-2 text-[#DFFF00] hover:underline font-medium">
                                        Drop as Guest &rarr;
                                    </Link>
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Pricing Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 mb-32 w-full place-items-center items-stretch">
                        {plans.map((plan, i) => (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + (i * 0.1) }}
                                className="w-full flex justify-center h-full"
                            >
                                <div className="w-full max-w-lg lg:max-w-none h-full">
                                    <PricingCard
                                        plan={plan}
                                        // isCurrent is ONLY true if logged in AND plan matches
                                        isCurrent={isLoggedIn && currentPlanCode === plan.planKey}
                                        loading={loadingPlan === plan.planKey}
                                        onCheckout={plan.onClick}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* FAQ Section */}
                    <div className="max-w-4xl mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className={`${heading.className} text-3xl font-bold mb-4`}>
                                Frequently asked questions
                            </h2>
                            <p className="text-gray-400">Quick answers. Then go drop files.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { q: "Can I cancel anytime?", a: "Yes! Cancel anytime from your account dashboard. No contracts, no hassle." },
                                { q: "What happens to my files?", a: "Files are automatically deleted after the session expires. We don't store them permanently." },
                                { q: "Not sure which plan to pick?", a: "We offer a 7-day money-back guarantee if you're not satisfied." },
                                { q: "Is it secure?", a: "Start with Free. Upgrade when you hit limits. You can cancel anytime from your dashboard." },
                            ].map((faq, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="p-8 rounded-3xl border border-white/5 bg-[#16181D]/50 hover:bg-[#16181D] transition-colors"
                                >
                                    <h3 className={`${heading.className} font-bold text-lg mb-3 text-white`}>{faq.q}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
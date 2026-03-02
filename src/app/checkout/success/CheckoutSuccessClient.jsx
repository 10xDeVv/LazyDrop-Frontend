// app/checkout/success/CheckoutSuccessClient.jsx
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import {
    CheckCircle,
    Loader2,
    ArrowRight,
    Zap,
    Receipt,
    RefreshCw,
    Clock,
    XCircle,
} from "lucide-react";
import { motion } from "framer-motion";

const heading = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });
const body = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], display: "swap" });

const TOKENS = {
    bg: "#0B0C0F",
    panel: "#16181D",
    text: "#F5F5F5",
    muted: "#9CA3AF",
    lime: "#DFFF00",
    border: "rgba(255,255,255,0.08)",
};

function isUpgradedPlan(plan) {
    return plan === "PLUS" || plan === "PRO";
}

export default function CheckoutSuccessClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");

    // syncing | confirmed | pending | failed
    const [status, setStatus] = useState("syncing");
    const [plan, setPlan] = useState(null);
    const [checkoutState, setCheckoutState] = useState(null);

    const redirectTimeoutRef = useRef(null);

    const checkSubscription = useCallback(async () => {
        if (!sessionId) {
            setStatus("failed");
            return;
        }

        try {
            setStatus("syncing");

            const checkout = await api.getCheckoutStatus(sessionId);

            setCheckoutState(checkout?.state ?? null);
            setPlan(checkout?.plan ?? null);

            if (checkout?.state === "CANCELED") {
                router.push("/checkout/cancel");
                return;
            }

            if (checkout?.state !== "CONFIRMED") {
                setStatus("pending");
                return;
            }

            for (let i = 0; i < 10; i++) {
                const sub = await api.getMySubscription();
                const dbPlan = sub?.planCode ?? null;

                if (dbPlan) setPlan(dbPlan);

                if (isUpgradedPlan(dbPlan)) {
                    setStatus("confirmed");

                    if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
                    redirectTimeoutRef.current = setTimeout(() => router.push("/account"), 1500);

                    return;
                }

                await new Promise((r) => setTimeout(r, 2000));
            }

            setStatus("pending");
        } catch (e) {
            console.error(e);
            setStatus("failed");
        }
    }, [router, sessionId]);

    useEffect(() => {
        checkSubscription();
        return () => {
            if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
        };
    }, [checkSubscription]);

    const title =
        status === "syncing"
            ? "Confirming your upgrade"
            : status === "confirmed"
                ? "You're all set"
                : status === "pending"
                    ? checkoutState === "CONFIRMED"
                        ? "Finalizing your plan"
                        : "Still confirming"
                    : "We couldn’t confirm it";

    const subtitle =
        status === "syncing"
            ? "We’re checking your checkout and updating your account."
            : status === "confirmed"
                ? "Your subscription is active. Redirecting you to your account..."
                : status === "pending"
                    ? checkoutState === "CONFIRMED"
                        ? "Checkout went through. Your account is finishing the update."
                        : "If you just paid, it may take a moment. You can refresh to recheck."
                    : "Something didn’t load properly. Refresh, or check your account in a moment.";

    const Icon = () => {
        if (status === "syncing") return <Loader2 className="w-10 h-10 text-[#DFFF00] animate-spin" />;
        if (status === "confirmed")
            return (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 10 }}>
                    <CheckCircle className="w-10 h-10 text-[#DFFF00]" />
                </motion.div>
            );

        if (status === "failed")
            return (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <XCircle className="w-10 h-10 text-red-400" />
                </motion.div>
            );

        return (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <Clock className="w-10 h-10 text-gray-400" />
            </motion.div>
        );
    };

    return (
        <div className={`${body.className} min-h-screen flex flex-col`} style={{ background: TOKENS.bg, color: TOKENS.text }}>
            <Navbar />

            <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#DFFF00]/5 rounded-full blur-[120px] pointer-events-none" />

                <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="max-w-lg w-full">
                    <div className="bg-[#16181D] border border-white/10 rounded-[40px] p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#DFFF00] to-transparent opacity-50" />

                        <div className="relative mb-8">
                            <div className="w-24 h-24 mx-auto rounded-full bg-[#1A1D23] border border-white/5 flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.3)] relative z-10">
                                <Icon />
                            </div>

                            <div
                                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#DFFF00]/10 rounded-full blur-xl transition-opacity duration-1000 ${
                                    status === "syncing" ? "animate-pulse" : status === "confirmed" ? "opacity-100" : "opacity-0"
                                }`}
                            />
                        </div>

                        <h1 className={`${heading.className} text-4xl sm:text-5xl font-bold mb-4 tracking-tight`}>{title}</h1>
                        <p className="text-gray-400 text-lg mb-10 leading-relaxed">{subtitle}</p>

                        <div className="bg-[#0B0C0F] border border-white/5 rounded-2xl p-4 mb-10 text-left space-y-2">
                            {sessionId && (
                                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span className="flex items-center gap-2">
                    <Receipt size={12} /> Ref ID
                  </span>
                                    <span className={`${mono.className} text-gray-400 truncate max-w-[150px]`}>{sessionId.slice(-8)}</span>
                                </div>
                            )}

                            {checkoutState && (
                                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span className="flex items-center gap-2">
                    <Zap size={12} /> Status
                  </span>
                                    <span className={`${mono.className} ${checkoutState === "CONFIRMED" ? "text-[#DFFF00]" : "text-gray-400"}`}>{checkoutState}</span>
                                </div>
                            )}

                            {plan && (
                                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span className="flex items-center gap-2">
                    <Zap size={12} /> Plan
                  </span>
                                    <span className={`${mono.className} ${plan === "FREE" ? "text-gray-400" : "text-[#DFFF00]"}`}>{plan}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-3">
                            {(status === "pending" || status === "failed") && (
                                <button
                                    onClick={() => checkSubscription()}
                                    className="group w-full py-4 bg-[#16181D] border border-[#DFFF00]/30 text-[#DFFF00] font-bold rounded-xl hover:bg-[#DFFF00]/10 transition-all flex items-center justify-center gap-2"
                                >
                                    <RefreshCw size={18} /> Refresh Status
                                </button>
                            )}

                            <button
                                onClick={() => router.push("/account")}
                                disabled={status === "syncing"}
                                className={`
                  group w-full py-4 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg
                  disabled:opacity-50 disabled:shadow-none disabled:cursor-wait
                  ${status === "confirmed" ? "bg-[#DFFF00] text-black hover:bg-[#ccee00]" : "bg-white text-black hover:bg-gray-200"}
                `}
                            >
                                Go to Account {status !== "syncing" && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                            </button>

                            <button
                                onClick={() => router.push("/drop")}
                                className="w-full py-4 border border-white/10 text-gray-500 font-bold rounded-xl hover:bg-white/5 hover:text-white transition-colors"
                            >
                                Start a Drop
                            </button>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
}

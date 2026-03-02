// app/drop/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/LazyDropContext";
import { createClient } from "@/lib/supabase";
import { api } from "@/lib/api";
import { PLANS } from "@/lib/stripe";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Space_Grotesk, Inter } from "next/font/google";
import { Zap, Loader2 } from "lucide-react";

const heading = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });
const body = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });

const TOKENS = {
    bg: "#0B0C0F",
    text: "#F5F5F5",
    muted: "#9CA3AF",
    lime: "#DFFF00",
};

// Normalize backend planCode safely
function normalizePlanCode(planCode) {
    const p = String(planCode || "").toUpperCase();
    if (p === "PRO") return "PRO";
    if (p === "PLUS") return "PLUS";
    return "FREE";
}

export default function DropPage() {
    const router = useRouter();
    const supabase = createClient();

    const { createPairing, queueFiles, showToast, loading } = useApp();

    const [planCode, setPlanCode] = useState("FREE"); // FREE | PLUS | PRO
    const [isDragging, setIsDragging] = useState(false);
    const [booting, setBooting] = useState(true); // optional: prevents flicker

    useEffect(() => {
        const load = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                // Not logged in => treat as FREE
                if (!session) {
                    setPlanCode("FREE");
                    setBooting(false);
                    return;
                }

                // Logged in => backend is source of truth
                const sub = await api.getMySubscription();

                // Expecting something like { planCode: "FREE" | "PLUS" | "PRO", ... }
                setPlanCode(normalizePlanCode(sub?.planCode));
            } catch (e) {
                console.error(e);
                // Fail closed: assume free
                setPlanCode("FREE");
            } finally {
                setBooting(false);
            }
        };

        load();
    }, [supabase]);

    const isPaid = planCode === "PLUS" || planCode === "PRO";

    // ✅ 3 plan mapping — adjust if your PLANS object differs
    const maxFileSize =
        planCode === "PRO"
            ? (PLANS.PRO?.features?.maxFileSize ?? PLANS.PLUS.features.maxFileSize)
            : planCode === "PLUS"
                ? PLANS.PLUS.features.maxFileSize
                : PLANS.FREE.features.maxFileSize;

    const startSession = async () => {
        try {
            const s = await createPairing();
            if (s?.code) router.push(`/session/${s.code}`);
        } catch (e) {
            console.error(e);
            showToast("Failed to start session", "error");
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files || []);
        if (droppedFiles.length === 0) return;

        const oversized = droppedFiles.filter((f) => f.size > maxFileSize);
        if (oversized.length > 0) {
            showToast(`File too large. Limit: ${(maxFileSize / 1024 / 1024).toFixed(0)}MB`, "error");
            return;
        }

        // Queue first, then create session, then redirect.
        queueFiles(droppedFiles);

        try {
            const s = await createPairing();
            if (s?.code) router.push(`/session/${s.code}`);
        } catch (e) {
            console.error(e);
            showToast("Failed to start session", "error");
        }
    };

    // Optional: a tiny boot loader so plan/limits don’t flicker
    if (booting) {
        return (
            <div className="min-h-screen bg-[#0B0C0F] flex items-center justify-center text-white">
                <Loader2 className="w-10 h-10 text-[#DFFF00] animate-spin" />
            </div>
        );
    }

    return (
        <div className={`${body.className} min-h-screen flex flex-col`} style={{ background: TOKENS.bg, color: TOKENS.text }}>
            <Navbar />

            <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-white/5 rounded-full blur-[140px] pointer-events-none -z-10" />

                <div className="w-full max-w-3xl relative z-10 text-center">
                    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                        <h1 className={`${heading.className} text-5xl sm:text-7xl font-bold mb-6 tracking-tight`}>
                            Ready to <span style={{ color: TOKENS.lime }}>Drop?</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-md mx-auto">
                            Create a secure, drop room. <br /> Start a session, then invite peers.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                        onDrop={handleDrop}
                        className={`
              relative rounded-[40px] border-2 border-dashed p-12 sm:p-16 transition-all duration-300
              ${isDragging ? "border-[#DFFF00] bg-[#DFFF00]/5 scale-[1.01]" : "border-white/10 bg-[#16181D] hover:border-white/20"}
            `}
                    >
                        <div className="flex flex-col items-center justify-center gap-8">
                            <div className="relative group/btn">
                                <div className="absolute inset-0 bg-[#DFFF00] blur-xl opacity-20 group-hover/btn:opacity-40 transition-opacity rounded-full duration-500" />
                                <button
                                    onClick={startSession}
                                    disabled={loading}
                                    className="relative px-10 py-5 bg-[#DFFF00] text-black rounded-full font-bold text-xl flex items-center gap-3 transition-transform active:scale-95 disabled:opacity-50 shadow-xl"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : <Zap className="fill-black" />}
                                    {loading ? "Creating..." : "Start Session"}
                                </button>
                            </div>

                            <div className="text-gray-500 text-sm font-medium uppercase tracking-widest">
                                {isDragging ? "Drop to auto-start" : "Drop files here to start instantly"}
                            </div>

                        </div>
                    </motion.div>



                    {!isPaid && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mt-8 text-sm text-gray-600">
                            Your limit: {(maxFileSize / 1024 / 1024).toFixed(0)}MB per file
                            {!isPaid && (
                                <>
                                    {" "}•{" "}
                                    <Link
                                        href="/pricing"
                                        className="text-gray-400 hover:text-[#DFFF00] transition-colors underline decoration-gray-700 underline-offset-4"
                                    >
                                        Upgrade for bigger drops
                                    </Link>
                                </>
                            )}
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
}

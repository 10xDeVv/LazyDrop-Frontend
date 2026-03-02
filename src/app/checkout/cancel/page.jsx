"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { XCircle, ArrowRight, ArrowLeft, PackageOpen } from "lucide-react";
import { motion } from "framer-motion";

// --- TYPOGRAPHY ---
const heading = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });
const body = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], display: "swap" });

// --- TOKENS ---
const TOKENS = {
    bg: "#0B0C0F",
    panel: "#16181D",
    text: "#F5F5F5",
    muted: "#9CA3AF",
    lime: "#DFFF00",
    red: "#FF4D4D",
    border: "rgba(255,255,255,0.08)"
};

export default function CheckoutCancelPage() {
    const router = useRouter();

    return (
        <div className={`${body.className} min-h-screen flex flex-col`} style={{ background: TOKENS.bg, color: TOKENS.text }}>
            <Navbar />

            <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">

                {/* Ambient Glow (Red for Cancel state) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="max-w-lg w-full"
                >
                    <div className="bg-[#16181D] border border-white/10 rounded-[40px] p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">

                        {/* Top Border Accent (Red) */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF4D4D] to-transparent opacity-50" />

                        {/* Icon State */}
                        <div className="relative mb-8">
                            <div className="w-24 h-24 mx-auto rounded-full bg-[#1A1D23] border border-white/5 flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.3)] relative z-10">
                                <motion.div
                                    initial={{ scale: 0, rotate: -45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 12 }}
                                >
                                    <XCircle className="w-10 h-10 text-[#FF4D4D]" />
                                </motion.div>
                            </div>
                            {/* Icon Glow */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-red-500/10 rounded-full blur-xl opacity-100" />
                        </div>

                        {/* Heading */}
                        <h1 className={`${heading.className} text-4xl sm:text-5xl font-bold mb-4 tracking-tight`}>
                            Checkout not completed
                        </h1>

                        {/* Subtext */}
                        <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                            All good — you weren’t charged. You can keep using LazyDrop on <span className="text-white font-medium">Free</span>, or upgrade anytime.
                        </p>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => router.push("/pricing")}
                                className="group w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-[#DFFF00] transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                            >
                                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                                Return to Pricing
                            </button>

                            <button
                                onClick={() => router.push("/drop")}
                                className="w-full py-4 border border-white/10 text-gray-400 font-bold rounded-xl hover:bg-white/5 hover:text-white transition-colors flex items-center justify-center gap-2"
                            >
                                <PackageOpen size={18} />
                                Continue as Free
                            </button>
                        </div>

                        {/* Footer Note */}
                        <p className="text-[10px] text-gray-600 mt-8 font-mono uppercase tracking-widest">
                            No charge was made
                        </p>

                    </div>
                </motion.div>
            </main>
        </div>
    );
}
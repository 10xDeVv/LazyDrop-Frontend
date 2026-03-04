"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, AlertCircle, Loader2, CheckCircle, KeyRound } from "lucide-react";
import { Space_Grotesk, Inter } from "next/font/google";

const heading = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });
const body = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });

const TOKENS = {
    bg: "#0E0F12",
    panel: "#16181D",
    text: "#F5F5F5",
    lime: "#DFFF00",
};

export default function ForgotPasswordPage() {
    const supabase = createClient();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setError("");

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?redirect=/account`,
            });
            if (error) throw error;
            setSent(true);
        } catch (err) {
            setError(err.message || "Failed to send reset email. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`${body.className} min-h-screen flex items-center justify-center p-4`} style={{ background: TOKENS.bg, color: TOKENS.text }}>
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#DFFF00]/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px]" />
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
                {/* Back Button */}
                <Link href="/login" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition mb-8 text-sm font-medium">
                    <ArrowLeft size={16} />
                    Back to login
                </Link>

                {/* Card */}
                <div className="p-8 sm:p-10 rounded-3xl border border-white/10 bg-[#16181D] shadow-2xl relative overflow-hidden">
                    {/* Top Glow Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#DFFF00]/50 to-transparent" />

                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#DFFF00] text-black mb-6 shadow-[0_0_20px_rgba(223,255,0,0.3)]">
                            <KeyRound size={24} />
                        </div>
                        <h1 className={`${heading.className} text-3xl font-bold mb-2`}>Reset password</h1>
                        <p className="text-gray-400">Enter your email and we'll send a reset link.</p>
                    </div>

                    {/* Success State */}
                    {sent ? (
                        <div className="text-center py-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#DFFF00]/10 mb-6">
                                <CheckCircle size={32} className="text-[#DFFF00]" />
                            </div>
                            <h2 className={`${heading.className} text-xl font-bold mb-2`}>Check your inbox</h2>
                            <p className="text-gray-400 text-sm mb-8">
                                We sent a password reset link to <span className="text-white font-medium">{email}</span>.
                            </p>
                            <Link href="/login" className="inline-flex items-center gap-2 text-[#DFFF00] hover:underline font-medium text-sm">
                                <ArrowLeft size={14} /> Back to login
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                                    <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-400">{error}</p>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Email</label>
                                    <div className="relative group">
                                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#DFFF00] transition-colors" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            required
                                            autoFocus
                                            className="w-full pl-11 pr-4 py-3.5 bg-black/30 border border-white/10 rounded-xl focus:border-[#DFFF00] focus:outline-none transition text-white placeholder-gray-700"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-[#DFFF00] text-black rounded-xl font-bold hover:bg-[#ccee00] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(223,255,0,0.15)]"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" />
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        "Send Reset Link"
                                    )}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

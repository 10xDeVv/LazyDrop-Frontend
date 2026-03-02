// app/login/LoginClient.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowLeft, AlertCircle, Loader2, Zap } from "lucide-react";
import { Space_Grotesk, Inter } from "next/font/google";

// --- FONTS & TOKENS ---
const heading = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });
const body = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });

const TOKENS = {
    bg: "#0E0F12",
    panel: "#16181D",
    text: "#F5F5F5",
    muted: "#9CA3AF",
    dim: "#6B7280",
    line: "rgba(255,255,255,0.10)",
    lime: "#DFFF00",
};

const safeRedirect = (path) =>
    typeof path === "string" && path.startsWith("/") ? path : "/dashboard";

export default function LoginClient() {
    const router = useRouter();
    const supabase = createClient();
    const params = useSearchParams();

    const redirect = safeRedirect(params.get("redirect"));

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;

            router.replace(redirect);
            router.refresh();
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError("");
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
                },
            });
            if (error) throw error;
        } catch (error) {
            setError(error.message);
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
                <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition mb-8 text-sm font-medium">
                    <ArrowLeft size={16} />
                    Back to home
                </Link>

                {/* Card */}
                <div className="p-8 sm:p-10 rounded-3xl border border-white/10 bg-[#16181D] shadow-2xl relative overflow-hidden">
                    {/* Top Glow Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#DFFF00]/50 to-transparent" />

                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#DFFF00] text-black mb-6 shadow-[0_0_20px_rgba(223,255,0,0.3)]">
                            <Zap size={24} fill="black" />
                        </div>
                        <h1 className={`${heading.className} text-3xl font-bold mb-2`}>Welcome back</h1>
                        <p className="text-gray-400">Log in to sync sessions across devices.</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                            <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Email */}
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
                                    className="w-full pl-11 pr-4 py-3.5 bg-black/30 border border-white/10 rounded-xl focus:border-[#DFFF00] focus:outline-none transition text-white placeholder-gray-700"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Password</label>
                            <div className="relative group">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#DFFF00] transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-black/30 border border-white/10 rounded-xl focus:border-[#DFFF00] focus:outline-none transition text-white placeholder-gray-700"
                                />
                            </div>
                        </div>

                        {/* Forgot Password */}
                        <div className="text-right">
                            <Link href="/forgot-password" className="text-xs font-medium text-gray-400 hover:text-[#DFFF00] transition-colors">
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-[#DFFF00] text-black rounded-xl font-bold hover:bg-[#ccee00] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(223,255,0,0.15)]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    <span>Logging in...</span>
                                </>
                            ) : (
                                "Log In"
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                            <span className="px-4 bg-[#16181D] text-gray-600">Or continue with</span>
                        </div>
                    </div>

                    {/* Google Login */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full py-3.5 border border-white/10 bg-white/5 rounded-xl font-medium hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-white"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google
                    </button>

                    {/* Sign Up Link */}
                    <p className="mt-8 text-center text-sm text-gray-500">
                        Don't have an account?{" "}
                        <Link href={`/signup?redirect=${encodeURIComponent(redirect)}`} className="text-[#DFFF00] hover:underline font-medium">
                            Sign up
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

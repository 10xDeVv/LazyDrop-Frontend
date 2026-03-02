// app/signup/SignupClient.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowLeft, AlertCircle, Loader2, CheckCircle, Zap } from "lucide-react";
import { Space_Grotesk, Inter } from "next/font/google";

// --- FONTS & TOKENS ---
const heading = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });
const body = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });

const TOKENS = {
    bg: "#0E0F12",
    panel: "#16181D",
    text: "#F5F5F5",
    muted: "#9CA3AF",
    lime: "#DFFF00",
};

const safeRedirect = (path) => (typeof path === "string" && path.startsWith("/") ? path : "/dashboard");

export default function SignUpPage() {
    const router = useRouter();
    const params = useSearchParams();
    const supabase = createClient();

    const redirect = safeRedirect(params.get("redirect")) || "/dashboard";

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // success flow states
    const [success, setSuccess] = useState(false);
    const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false);

    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);
        setNeedsEmailConfirm(false);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: name },
                    emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
                },
            });

            if (error) throw error;

            setSuccess(true);

            // If email confirmations are disabled, you'll get a session immediately.
            if (data?.session) {
                router.replace(redirect);
                router.refresh();
                return;
            }

            // Email confirmation is required
            setNeedsEmailConfirm(true);
        } catch (err) {
            setError(err?.message || "Sign up failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
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
        } catch (err) {
            setError(err?.message || "Google sign up failed. Please try again.");
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
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#DFFF00] text-black mb-6 shadow-[0_0_20px_rgba(223,255,0,0.3)]">
                            <Zap size={24} fill="black" />
                        </div>
                        <h1 className={`${heading.className} text-3xl font-bold mb-2`}>Create your account</h1>
                        <p className="text-gray-400">Sync sessions across devices + unlock higher limits.</p>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="mb-6 p-4 rounded-xl bg-[#DFFF00]/10 border border-[#DFFF00]/20 flex items-start gap-3">
                            <CheckCircle size={20} className="text-[#DFFF00] shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-[#DFFF00] font-bold">
                                    {needsEmailConfirm ? "Account created! Check your email." : "Account created!"}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {needsEmailConfirm
                                        ? "Confirm your email to activate your account, then come back and log in."
                                        : "Redirecting to dashboard..."}
                                </p>

                                {needsEmailConfirm && (
                                    <div className="mt-3">
                                        <button
                                            type="button"
                                            onClick={() => router.push(`/login?redirect=${encodeURIComponent(redirect)}`)}
                                            className="text-xs font-bold text-[#DFFF00] hover:underline"
                                        >
                                            Go to login
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                            <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSignUp} className="space-y-5">
                        {/* Name */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Name</label>
                            <div className="relative group">
                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#DFFF00] transition-colors" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your Name"
                                    required
                                    autoComplete="name"
                                    className="w-full pl-11 pr-4 py-3.5 bg-black/30 border border-white/10 rounded-xl focus:border-[#DFFF00] focus:outline-none transition text-white placeholder-gray-700"
                                />
                            </div>
                        </div>

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
                                    autoComplete="email"
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
                                    minLength={6}
                                    autoComplete="new-password"
                                    className="w-full pl-11 pr-4 py-3.5 bg-black/30 border border-white/10 rounded-xl focus:border-[#DFFF00] focus:outline-none transition text-white placeholder-gray-700"
                                />
                            </div>
                            <p className="mt-2 text-xs text-gray-600">At least 6 characters</p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || success}
                            className="w-full py-4 bg-[#DFFF00] text-black rounded-xl font-bold hover:bg-[#ccee00] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(223,255,0,0.15)]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    <span>Creating account...</span>
                                </>
                            ) : success ? (
                                <>
                                    <CheckCircle size={20} />
                                    <span>Success!</span>
                                </>
                            ) : (
                                "Create Account"
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

                    {/* Google Sign Up */}
                    <button
                        onClick={handleGoogleSignUp}
                        disabled={loading || success}
                        className="w-full py-3.5 border border-white/10 bg-white/5 rounded-xl font-medium hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-white"
                    >
                        {/* google icon */}
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google
                    </button>

                    {/* Log In Link */}
                    <p className="mt-4 text-center text-sm text-gray-500">
                        Already have an account?{" "}
                        <Link href={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-[#DFFF00] hover:underline font-medium">
                            Log in
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

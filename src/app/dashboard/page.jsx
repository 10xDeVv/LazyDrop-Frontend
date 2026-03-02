"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import {
    Zap, ChevronRight, Activity, LogOut, Loader2, Trash2,
    Crown, HardDrive, FileText, AlertTriangle, User, Shield, Copy, Check, Server, Network
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    purple: "#A855F7",
    red: "#FF4D4D",
    border: "rgba(255,255,255,0.08)"
};

export default function Dashboard() {
    const router = useRouter();
    const supabase = createClient();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeSessions, setActiveSessions] = useState([]);
    const [subscription, setSubscription] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const [counts, setCounts] = useState({ ownedActive: 0, joinedActive: 0 });


    useEffect(() => {
        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const currentUser = session?.user || null;
            setUser(currentUser);

            try {
                // 1. Fetch Sessions
                const sessionsData = await api.getActiveSessions();
                setActiveSessions(sessionsData.sessions || []);
                setCounts({
                    ownedActive: sessionsData?.counts?.ownedActive ?? 0,
                    joinedActive: sessionsData?.counts?.joinedActive ?? 0,
                });

                // 2. Fetch Subscription (If Auth)
                if (currentUser) {
                    try {
                        const subData = await api.getMySubscription();
                        setSubscription(subData);
                    } catch (e) {
                        console.warn("Sub fetch failed", e);
                    }
                }
            } catch (err) {
                console.error("Failed to load dashboard:", err);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    const handleSessionAction = async (session) => {
        const isOwner = session.myRole === 'OWNER';
        if (!confirm(isOwner ? "End session for everyone?" : "Leave this session?")) return;

        try {
            if (isOwner) await api.endSession(session.id);
            else await api.leaveSession(session.id);
            setActiveSessions(prev => prev.filter(s => s.id !== session.id));
            setCounts(prev => ({
                ownedActive: prev.ownedActive - (isOwner ? 1 : 0),
                joinedActive: prev.joinedActive - (!isOwner ? 1 : 0),
            }));
        } catch (err) {
            alert("Action failed. Please try again.");
        }
    };

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(`${window.location.origin}/session/${code}`);
        setCopiedId(code);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B0C0F] flex items-center justify-center text-white">
                <Loader2 className="w-10 h-10 text-[#DFFF00] animate-spin" />
            </div>
        );
    }

    // --- LOGIC: SPLIT USAGE ---
    const planName = subscription?.planCode || "GUEST";
    const sessionLimit = subscription?.limits?.maxActiveSessions || 1;

    // Only count sessions I OWN towards the limit
    const hostedCount = counts.ownedActive;
    const joinedCount = counts.joinedActive;


    const usagePercent = Math.min((hostedCount / sessionLimit) * 100, 100);

    return (
        <div className={`${body.className} min-h-screen flex flex-col`} style={{ background: TOKENS.bg, color: TOKENS.text }}>
            <Navbar />

            <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">

                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className={`${heading.className} text-4xl md:text-5xl font-bold mb-3 tracking-tight`}>
                            Dashboard
                        </h1>
                        <p className="text-gray-400 text-lg flex items-center gap-2">
                            Signed in as<span className="text-white font-medium">{user?.email || "Guest"}</span>.
                            {user && <span className={`text-xs px-2 py-0.5 rounded border border-white/20 uppercase tracking-widest ${mono.className}`}>{planName}</span>}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {!user ? (
                            <Link href="/signup" className="text-sm text-[#DFFF00] hover:underline flex items-center gap-1">
                                <AlertTriangle size={14} /> Sign in to save your sessions
                            </Link>
                        ) : (
                            <button onClick={handleLogout} className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-gray-400 text-sm font-bold hover:text-white hover:bg-white/10 transition flex items-center gap-2">
                                <LogOut size={16} /> Log Out
                            </button>
                        )}
                    </div>
                </div>

                {/* --- HOSTING METER (Only for Auth Users) --- */}
                {user && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <div className="md:col-span-2 bg-[#16181D] border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                            <div className="flex justify-between items-end mb-4 relative z-10">
                                <div>
                                    <div className="mb-1">
                                        <p className={`${mono.className} text-xs text-gray-500 uppercase tracking-widest flex items-center gap-2`}>
                                            <Server size={14} /> Hosting Capacity
                                        </p>
                                        <p className="text-[12px] text-gray-500 mt-0.5">
                                            Only sessions you create count toward your plan.
                                        </p>
                                    </div>

                                    <h3 className="text-2xl font-bold text-white">{hostedCount} <span className="text-gray-500">/ {sessionLimit}</span></h3>
                                </div>
                                {hostedCount >= sessionLimit && (
                                    <Link href="/pricing" className="text-xs font-bold text-[#DFFF00] hover:underline flex items-center gap-1">
                                        <Zap size={12} /> Upgrade for more
                                    </Link>
                                )}
                            </div>
                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden relative z-10">
                                <div className="h-full bg-[#DFFF00] transition-all duration-500 ease-out" style={{ width: `${usagePercent}%` }} />
                            </div>

                            <Activity size={100} className="absolute -right-4 -bottom-4 text-white/5 rotate-12 pointer-events-none" />
                        </div>

                        {/* Upgrade CTA */}
                        {planName === 'FREE' && (
                            <div className="bg-gradient-to-br from-[#16181D] to-[#1A1D23] border border-[#DFFF00]/20 rounded-3xl p-6 flex flex-col justify-between group cursor-pointer hover:border-[#DFFF00]/40 transition-all" onClick={() => router.push("/pricing")}>
                                <div>
                                    <div className="w-10 h-10 rounded-full bg-[#DFFF00]/10 flex items-center justify-center mb-4 text-[#DFFF00]"><Crown size={20} /></div>
                                    <h3 className="text-lg font-bold text-white">Upgrade Plan</h3>
                                    <p className="text-xs text-gray-400 mt-1">Bigger files, longer sessions, more control</p>
                                </div>
                                <div className="mt-4 flex items-center text-[#DFFF00] text-sm font-bold group-hover:translate-x-1 transition-transform">
                                    View Pricing <ChevronRight size={16} />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- SESSION LIST (Owned & Joined) --- */}
                <h2 className={`${heading.className} text-2xl font-bold mb-6 flex items-center gap-3`}>
                    Your Active Sessions
                    <span className="text-xs bg-white/10 px-2 py-1 rounded-full text-gray-400 font-mono">{activeSessions.length}</span>


                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {activeSessions.length > 0 ? (
                            activeSessions.map((session) => {
                                const isOwner = session.myRole === 'OWNER';
                                const isExpired = new Date(session.expiresAt) < new Date();

                                // Dynamic Styling based on Role
                                const roleColor = isOwner ? TOKENS.lime : TOKENS.purple;
                                const roleLabel = isOwner ? "HOST" : "PEER";
                                const roleBg = isOwner ? "bg-[#DFFF00]/10" : "bg-purple-500/10";
                                const roleText = isOwner ? "text-[#DFFF00]" : "text-purple-400";

                                return (
                                    <motion.div
                                        key={session.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className={`
                                            bg-[#16181D] border rounded-3xl p-6 relative flex flex-col justify-between group transition-all
                                            ${isExpired ? "border-red-500/20 opacity-60" : "border-white/5 hover:border-white/10"}
                                        `}
                                    >
                                        {/* Card Header */}
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-bold text-xl text-white border border-white/5">
                                                    {session.code.slice(0, 1)}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className={`${mono.className} text-xl font-bold text-white tracking-wider`}>
                                                            {session.code}
                                                        </h3>
                                                        <button
                                                            onClick={() => handleCopyCode(session.code)}
                                                            className="text-gray-500 hover:text-white transition-colors"
                                                            title="Copy Invite Link"
                                                        >
                                                            {copiedId === session.code ? <Check size={14} className="text-[#DFFF00]" /> : <Copy size={14} />}
                                                        </button>
                                                    </div>
                                                    {/* Role Badge */}
                                                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${roleBg} ${roleText}`}>
                                                        {isOwner ? <Server size={10} /> : <Network size={10} />}
                                                        {roleLabel}
                                                    </div>
                                                </div>
                                            </div>
                                            {isExpired && (
                                                <span className="px-2 py-1 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase rounded border border-red-500/20">Expired</span>
                                            )}
                                        </div>

                                        {/* Stats */}
                                        <div className="space-y-3 mb-8">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500 flex items-center gap-2"><User size={14} /> Participants</span>
                                                <span className="text-white font-mono">{session.participantCount || 1}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500 flex items-center gap-2"><FileText size={14} /> Files</span>
                                                <span className="text-white font-mono">{session.fileCount || 0}</span>
                                            </div>
                                            <div className="w-full h-px bg-white/5 my-2" />
                                            <div className="flex justify-between items-center text-xs text-gray-500">
                                                <span>Expires at:</span>
                                                <span className="font-mono text-gray-400">
                                                    {new Date(session.expiresAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="grid grid-cols-2 gap-3">
                                            {!isExpired ? (
                                                <Link
                                                    href={`/session/${session.code}`}
                                                    className={`
        col-span-1 py-3 font-bold rounded-xl text-sm text-center transition flex items-center justify-center gap-2
        ${isOwner
                                                        ? "bg-[#DFFF00] text-black hover:bg-[#ccee00] shadow-[0_0_20px_rgba(223,255,0,0.25)]"
                                                        : "bg-white text-black hover:bg-gray-200 border border-[#DFFF00]/30"}
    `}
                                                >
                                                    Rejoin
                                                </Link>

                                            ) : (
                                                <button disabled className="col-span-1 py-3 bg-white/5 text-gray-600 font-bold rounded-xl text-sm cursor-not-allowed">
                                                    Expired
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleSessionAction(session)}
                                                className={`
                                                    col-span-1 py-3 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition border
                                                    ${isOwner
                                                    ? "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20"
                                                    : "bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white"
                                                }
                                                `}
                                            >
                                                {isOwner ? <Trash2 size={14} /> : <LogOut size={14} />}
                                                {isOwner ? "End" : "Leave"}
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            // --- EMPTY STATE ---
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="col-span-full flex flex-col items-center justify-center py-20 bg-[#16181D]/50 rounded-[32px] border border-white/5 border-dashed"
                            >
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                    <Activity size={32} className="text-gray-600" />
                                </div>
                                <h3 className={`${heading.className} text-2xl font-bold text-white mb-2`}>No Active sessions</h3>
                                <p className="text-gray-500 max-w-sm text-center mb-2">
                                    You aren't hosting or joined to any sessions right now.
                                </p>

                                <Link
                                    href="/drop"
                                    className="px-8 py-4 bg-[#DFFF00] text-black font-bold rounded-xl hover:bg-[#ccee00] transition shadow-lg flex items-center gap-2"
                                >
                                    <Zap size={18} fill="black" /> Start New Drop
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
}
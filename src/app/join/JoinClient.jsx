"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/LazyDropContext";
import QRScanner from "@/components/QRScanner";
import { useRouter, useSearchParams } from "next/navigation";
import {
    QrCode, FileText, Image as ImageIcon, Video, Music, FileArchive, File, Download,
    CheckCircle, Loader2, ArrowRight, Wifi
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Space_Grotesk, Inter } from "next/font/google";

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

// --- LOGIC HELPERS ---
function parseJoinUrl(text) {
    try {
        const url = new URL(text);
        return {
            code: (url.searchParams.get("code") || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase(),
            secret: url.searchParams.get("secret") || undefined,
        };
    } catch {
        const code = (text.match(/code=([A-Za-z0-9]{8})/i)?.[1] || "").toUpperCase();
        return { code, secret: undefined };
    }
}

const getFileIcon = (fileName) => {
    const ext = fileName?.split(".").pop().toLowerCase() || "";
    const iconClass = "w-6 h-6";
    if (["pdf", "doc", "docx", "txt"].includes(ext)) return <FileText className={`${iconClass} text-blue-400`} />;
    if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext)) return <ImageIcon className={`${iconClass} text-purple-400`} />;
    if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) return <Video className={`${iconClass} text-red-400`} />;
    if (["mp3", "wav", "ogg", "flac"].includes(ext)) return <Music className={`${iconClass} text-yellow-400`} />;
    if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return <FileArchive className={`${iconClass} text-orange-400`} />;
    return <File className={`${iconClass} text-gray-400`} />;
};

function PasswordPromptModal({ onSubmit, onClose }) {
    const [password, setPassword] = useState("");
    const handleSubmit = (e) => { e.preventDefault(); if (password.length >= 4) onSubmit(password); };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#16181D] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#DFFF00] to-transparent" />
                <h3 className={`${heading.className} text-xl font-bold mb-4`}>Password Required</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        autoFocus
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-[#DFFF00] text-white"
                    />
                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-3 text-sm font-bold border border-white/10 rounded-xl text-gray-300">
                            Cancel
                        </button>
                        <button type="submit" className="flex-1 px-4 py-3 text-sm font-bold bg-[#DFFF00] text-black rounded-xl hover:bg-[#ccee00]">
                            Unlock
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

export default function JoinClient() {
    const {
        currentSession,
        isConnected,
        isConnecting,
        showToast,
        leaveRoom,
        files,
        formatFileSize,
        downloadFile,
        downloadAllFiles,
        autoDownload,
        toggleAutoDownload
    } = useApp();

    const [code, setCode] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
    const inputRef = useRef(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const c = (searchParams.get("code") || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
        if (c.length === 8) setCode(c.slice(0, 4) + "-" + c.slice(4));
    }, [searchParams]);

    useEffect(() => {
        if (!isConnected && !modalOpen && inputRef.current) {
            const timer = setTimeout(() => inputRef.current?.focus(), 300);
            return () => clearTimeout(timer);
        }
    }, [isConnected, modalOpen]);

    const handleInput = (e) => {
        const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
        let formatted = raw;
        if (raw.length > 4) formatted = raw.slice(0, 4) + "-" + raw.slice(4, 8);
        setCode(formatted);
    };

    const handleJoin = async (e) => {
        if (e) e.preventDefault();
        const cleanCode = code.replace(/[^A-Z0-9]/g, "");
        if (cleanCode.length === 8) router.push(`/session/${cleanCode}`);
    };

    const onScanResult = async (text) => {
        const { code: scanned } = parseJoinUrl(text);
        if (!scanned || scanned.length !== 8) {
            showToast("Invalid QR Code (Expected 8 chars)", "error");
            return;
        }
        setCode(scanned);
        setModalOpen(false);
        router.push(`/session/${scanned}`);
    };

    const handlePasswordSubmit = async (password) => {
        setShowPasswordPrompt(false);
        const cleanCode = code.replace(/[^A-Z0-9]/g, "");
        router.push(`/session/${cleanCode}?pw=${encodeURIComponent(password)}`);
    };

    const receivedFiles = files.filter(f => f.status === "uploaded" || f.status === "downloaded");

    return (
        <div className={`${body.className} min-h-screen flex flex-col`} style={{ background: TOKENS.bg, color: TOKENS.text }}>
            <Navbar />

            <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative pt-24 pb-12 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#DFFF00]/5 rounded-full blur-[120px] pointer-events-none -z-10" />

                <div className="w-full max-w-xl relative z-10">
                    <AnimatePresence mode="wait">

                        {/* STATE 1: INPUT */}
                        {!isConnected && !isConnecting && (
                            <motion.div key="input" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="text-center">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-gray-400 mb-8">
                                    <Download size={14} /> Connect Mode
                                </div>
                                <h1 className={`${heading.className} text-4xl sm:text-6xl font-bold mb-4`}>Join a Session</h1>
                                <p className="text-gray-400 mb-10 text-lg">Paste the key or scan the QR.</p>

                                <form onSubmit={handleJoin} className="relative max-w-sm mx-auto group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-[#DFFF00]/20 to-[#DFFF00]/0 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500 pointer-events-none" />
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={code}
                                        onChange={handleInput}
                                        placeholder="ABCD-EFGH"
                                        maxLength={9}
                                        autoComplete="off"
                                        spellCheck="false"
                                        className={`w-full bg-[#16181D] border-2 text-center text-4xl sm:text-5xl font-mono font-bold tracking-widest py-6 rounded-2xl focus:outline-none focus:border-[#DFFF00] placeholder-gray-700 transition-all uppercase shadow-2xl ${code.length > 0 ? "border-white/20" : "border-white/10"}`}
                                        style={{ color: code.length === 9 ? TOKENS.lime : "white" }}
                                    />
                                    <button type="submit" disabled={code.length < 8} className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-[#DFFF00] text-black disabled:opacity-0 disabled:translate-x-4 transition-all hover:scale-105">
                                        <ArrowRight size={24} />
                                    </button>
                                </form>

                                <div className="mt-10 flex justify-center gap-4">
                                    <button onClick={() => setModalOpen(true)} className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-center gap-2 text-sm font-medium">
                                        <QrCode size={18} /> Scan QR
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STATE 2: CONNECTING */}
                        {isConnecting && !isConnected && (
                            <motion.div key="connecting" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20">
                                <div className="relative w-32 h-32 mb-10 flex items-center justify-center">
                                    <motion.div className="absolute inset-0 rounded-full border border-[#DFFF00]/30" animate={{ scale: [1, 1.5], opacity: [0.5, 0] }} transition={{ duration: 2, repeat: Infinity }} />
                                    <motion.div className="absolute inset-0 rounded-full border border-[#DFFF00]/30" animate={{ scale: [1, 2], opacity: [0.5, 0] }} transition={{ duration: 2, delay: 0.5, repeat: Infinity }} />
                                    <div className="w-16 h-16 bg-[#DFFF00]/10 rounded-full flex items-center justify-center border border-[#DFFF00]">
                                        <Wifi className="w-8 h-8 text-[#DFFF00] animate-pulse" />
                                    </div>
                                </div>
                                <h2 className={`${heading.className} text-3xl font-bold mb-2`}>Searching...</h2>
                                <p className="text-gray-400 font-mono text-sm">Targeting Session: {code}</p>
                            </motion.div>
                        )}

                        {/* STATE 3: CONNECTED */}
                        {isConnected && (
                            <motion.div key="connected" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 bg-[#DFFF00] rounded-full animate-pulse shadow-[0_0_10px_#DFFF00]" />
                                        <div>
                                            <span className="text-sm font-bold uppercase tracking-widest text-white block">Connected</span>
                                            <span className="text-xs text-gray-500 font-mono">{currentSession?.codeDisplay}</span>
                                        </div>
                                    </div>
                                    <button onClick={leaveRoom} className="text-xs text-red-400 hover:text-white transition-colors border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/20">
                                        Leave
                                    </button>
                                </div>

                                <div className="bg-[#16181D] border border-white/10 rounded-[32px] overflow-hidden min-h-[400px] flex flex-col shadow-2xl">
                                    <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                        <h3 className={`${heading.className} text-xl font-bold`}>Inbox</h3>
                                        <div onClick={toggleAutoDownload} className="flex items-center gap-2 cursor-pointer group">
                                            <span className="text-xs font-bold uppercase text-gray-500 group-hover:text-white transition">Auto-Save</span>
                                            <div className={`w-10 h-5 rounded-full relative transition-colors ${autoDownload ? "bg-[#DFFF00]" : "bg-white/10"}`}>
                                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-black transition-transform ${autoDownload ? "left-6" : "left-1"}`} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
                                        {receivedFiles.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-center py-20">
                                                <Loader2 className="w-8 h-8 text-gray-600 animate-spin mb-4" />
                                                <h3 className="text-xl font-bold text-white mb-2">Waiting for Sender</h3>
                                                <p className="text-gray-500 text-sm">Files will appear here...</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {receivedFiles.map((file) => (
                                                    <motion.div key={file.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between p-4 bg-[#0E0F12] border border-white/5 rounded-2xl group hover:border-[#DFFF00]/30 transition-colors">
                                                        <div className="flex items-center gap-4 min-w-0 flex-1">
                                                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">{getFileIcon(file.name)}</div>
                                                            <div className="min-w-0 flex-1">
                                                                <h4 className="text-sm font-bold text-white truncate mb-1">{file.name}</h4>
                                                                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            {file.status === "uploaded" ? (
                                                                <button onClick={() => downloadFile(file.id)} className="p-3 rounded-xl bg-white/5 hover:bg-[#DFFF00] hover:text-black transition-all group/btn" title="Download">
                                                                    <Download size={20} className="text-gray-400 group-hover/btn:text-black" />
                                                                </button>
                                                            ) : (
                                                                <div className="flex items-center gap-2 text-[#DFFF00]">
                                                                    <CheckCircle size={18} />
                                                                    <span className="text-xs font-bold hidden sm:inline">Saved</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {receivedFiles.length > 1 && (
                                        <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                                            <button onClick={downloadAllFiles} className="w-full py-4 rounded-xl bg-[#DFFF00] text-black font-bold flex items-center justify-center gap-2 hover:bg-[#ccee00] transition">
                                                <Download size={20} /> Download All ({receivedFiles.length})
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {modalOpen && <QRScanner onResult={onScanResult} onClose={() => setModalOpen(false)} />}
                {showPasswordPrompt && <PasswordPromptModal onSubmit={handlePasswordSubmit} onClose={() => setShowPasswordPrompt(false)} />}
            </main>
        </div>
    );
}

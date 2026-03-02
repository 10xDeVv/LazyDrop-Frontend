"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/LazyDropContext";
import Navbar from "@/components/Navbar";
import { QRCodeSVG } from "qrcode.react";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import {
    Clock, Upload, File as FileIcon, X, CheckCircle, Loader2,
    Send, Lock, Trash2, Copy, Download, Image as ImageIcon,
    Music, Video, FileArchive, FileText, Zap, LogOut, Shield,
    Activity, Smartphone, Monitor, MessageSquare, ChevronDown
} from "lucide-react";

// --- TYPOGRAPHY ---
const heading = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });
const body = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], display: "swap" });

// --- TOKENS ---
const TOKENS = {
    bg: "#0B0C0F", // Deep Matte Charcoal
    panel: "#16181D",
    text: "#F5F5F5",
    muted: "#9CA3AF",
    lime: "#DFFF00",
    red: "#FF4D4D",
    border: "rgba(255,255,255,0.08)"
};

// --- CUSTOM CSS ---
const GLOBAL_STYLES = `
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
`;

// --- HELPER: File Icon ---
const GetFileIcon = ({fileName}) => {
    const ext = fileName?.split(".").pop().toLowerCase() || "";
    const cls = "w-6 h-6 stroke-[1.5]";
    if (["pdf", "doc", "docx", "txt"].includes(ext)) return <FileText className={`${cls} text-blue-400`} />;
    if (["jpg", "jpeg", "png", "webp", "svg"].includes(ext)) return <ImageIcon className={`${cls} text-purple-400`} />;
    if (["mp4", "mov", "avi", "mkv"].includes(ext)) return <Video className={`${cls} text-red-400`} />;
    if (["mp3", "wav", "flac"].includes(ext)) return <Music className={`${cls} text-yellow-400`} />;
    if (["zip", "rar", "7z", "tar"].includes(ext)) return <FileArchive className={`${cls} text-orange-400`} />;
    return <FileIcon className={`${cls} text-gray-500`} />;
};

// --- CHAT CONTENT COMPONENT ---
const ChatContent = ({
                         notes, myParticipantId, participantNameMap, noteInput, setNoteInput,
                         handleSendNote, isGuest, router, code, notesEndRef, closeDrawer
                     }) => {
    return (
        <div className="flex flex-col h-full bg-[#16181D] overflow-hidden">
            <div className="p-5 border-b border-white/5 bg-[#16181D] flex justify-between items-center sticky top-0 z-20 shrink-0">
                <h3 className="text-sm font-bold text-white flex items-center gap-3">
                    <Shield size={16} className="text-[#DFFF00]" />
                    <span className={`${mono.className} text-[10px] uppercase tracking-widest`}>Session_Log</span>
                </h3>
                {closeDrawer ? (
                    <button onClick={closeDrawer} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400">
                        <ChevronDown size={20} />
                    </button>
                ) : (
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
                    </div>
                )}
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-6 bg-[#0E0F12]/50 custom-scrollbar relative min-h-0">
                {isGuest && (
                    <div className="absolute inset-0 z-30 backdrop-blur-md bg-black/40 flex flex-col items-center justify-center text-center p-8">
                        <div className="w-16 h-16 rounded-full bg-[#16181D] border border-white/10 flex items-center justify-center mb-6 shadow-2xl ring-1 ring-white/5">
                            <Lock size={28} className="text-gray-400" />
                        </div>
                        <h4 className={`${heading.className} text-xl font-bold text-white mb-2`}>Members Only</h4>
                        <p className="text-sm text-gray-400 mb-6 max-w-[220px]">
                            Notes are available to signed-in members. Sign in to view and send messages.
                        </p>
                        <button
                            onClick={() => router.push(`/login?redirect=${encodeURIComponent(`/session/${code}`)}`)}
                            className="w-full py-3 bg-[#DFFF00] hover:bg-[#ccee00] text-black font-bold rounded-xl text-xs uppercase tracking-widest transition-transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
                        >
                            <Zap size={14} fill="black" />
                            Unlock
                        </button>
                    </div>
                )}

                {notes.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-30 select-none">
                        <p className={`${mono.className} text-xs text-[#DFFF00] mb-2`}>{'>'} system.init_log()</p>
                        <p className="text-sm text-gray-500">No notes yet. Say something..</p>
                    </div>
                ) : (
                    notes.map((note) => {
                        const isMine = String(note.senderId) === String(myParticipantId);
                        const label = isMine ? "YOU" : (participantNameMap.get(note.senderId) || `PEER ${note.senderId?.slice(-4)}`);

                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={note.id}
                                className={`flex flex-col w-full ${isMine ? "items-start" : "items-end"}`}
                            >
                                <div className={`flex items-center gap-2 mb-1 px-1 ${isMine ? "" : "flex-row-reverse"}`}>
                                    <span className={`${mono.className} text-[9px] font-bold uppercase tracking-wider ${isMine ? "text-[#DFFF00]" : "text-purple-400"}`}>
                                        {label}
                                    </span>
                                    <span className={`${mono.className} text-[9px] text-gray-600`}>
                                        {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div
                                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-lg backdrop-blur-sm ${isMine
                                        ? "bg-[#DFFF00] text-black rounded-tr-sm font-medium"
                                        : "bg-[#252525]/80 text-gray-200 rounded-tl-sm border border-white/10"
                                    }`}
                                >
                                    {note.content}
                                </div>
                            </motion.div>
                        );
                    })
                )}
                <div ref={notesEndRef} />
            </div>

            <div className="p-4 border-t border-white/5 bg-[#16181D] relative z-20 shrink-0">
                <form onSubmit={handleSendNote} className="flex gap-3">
                    <input
                        value={noteInput}
                        onChange={e => setNoteInput(e.target.value)}
                        placeholder={isGuest ? "Sign in to use notes" : "Type a note..."}
                        disabled={isGuest}
                        className="flex-1 bg-[#0E0F12] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#DFFF00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                        type="submit"
                        disabled={!noteInput.trim() || isGuest}
                        className="p-3.5 bg-[#DFFF00] text-black rounded-xl hover:bg-[#ccee00] disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
                    >
                        <Send size={18} strokeWidth={2.5} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default function SessionRoom() {
    const params = useParams();
    const router = useRouter();
    const code = params?.code;

    const {
        currentSession,
        joinSessionSequence,
        files,
        notes,
        myParticipantId,
        participants,
        isOwner,
        isGuest,
        sendSessionNote,
        endSessionForEveryone,
        leaveRoom,
        timeLeft,
        formatTime,
        formatFileSize,
        processFiles,
        downloadFile,
        flushQueuedFiles,
        showToast,
        loading
    } = useApp();

    const [noteInput, setNoteInput] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [hasFailed, setHasFailed] = useState(false);
    const fileInputRef = useRef(null);
    const notesEndRef = useRef(null);

    // --- INITIALIZATION ---
    useEffect(() => {
        if (!code || hasFailed) return;

        if (currentSession?.code === code && !loading) return;
        if (loading) return;

        joinSessionSequence(code).then(success => {
            if (!success) {
                setHasFailed(true);

                if (typeof window !== 'undefined' && !window.location.pathname.includes(code)) return;

                showToast("Redirecting to join page...", "info");
                router.push("/join");
            }
        });
    }, [code, currentSession, joinSessionSequence, router, loading]);

    // --- AUTO SCROLL NOTES ---
    useEffect(() => {
        const container = notesEndRef.current?.parentElement;
        if (!container) return;

        const isNearBottom =
            container.scrollHeight - container.scrollTop - container.clientHeight < 120;

        if (isNearBottom) {
            notesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [notes]);


    // --- NAME MAPPING ---
    const participantNameMap = useMemo(() => {
        const m = new Map();
        (participants || []).forEach(p => {
            const pid = p.participantId || p.id;
            if (!pid) return;
            const segment = (typeof pid === 'string') ? pid.slice(-4) : "....";
            const name = p.displayName || `Peer ${segment}`;
            m.set(pid, name);
        });
        return m;
    }, [participants]);

    useEffect(() => {
        if (!currentSession?.id) return;
        flushQueuedFiles();
    }, [currentSession?.id, flushQueuedFiles]);


    const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const onDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
    const onDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const dropped = Array.from(e.dataTransfer.files);
        if (dropped.length > 0) processFiles(dropped);
    };

    const handleSendNote = (e) => {
        e.preventDefault();
        if (!noteInput.trim()) return;
        sendSessionNote(noteInput);
        setNoteInput("");
    };

    const handleExit = async () => {
        if (isOwner) {
            if (confirm("End session for everyone?\n\nLinks will stop working and files will be removed from this session."))
            {
                await endSessionForEveryone();
            }
        } else {
            leaveRoom();
        }
    };

    const copyLink = async () => {
        if (!currentSession) return;
        const link = `${window.location.origin}/session/${currentSession.code}`;

        try {
            // Primary method
            await navigator.clipboard.writeText(link);
            showToast("Link copied to clipboard!");
        } catch (err) {
            // Fallback method
            const textArea = document.createElement("textarea");
            textArea.value = link;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                showToast("Link copied to clipboard!");
            } catch (fallbackErr) {
                console.error("Failed to copy", fallbackErr);
                showToast("Failed to copy link", "error");
            }
            document.body.removeChild(textArea);
        }
    };

    if (loading || !currentSession) {
        return (
            <div className="min-h-screen bg-[#0B0C0F] flex flex-col items-center justify-center text-white gap-6">
                <Loader2 className="w-12 h-12 text-[#DFFF00] animate-spin" />
                <p className={`${mono.className} text-gray-500 text-sm tracking-[0.2em] uppercase`}>Connecting...</p>
            </div>
        );
    }

    const joinLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/session/${currentSession.code}`;

    return (
        <div className={`${body.className} min-h-screen flex flex-col`} style={{ background: TOKENS.bg, color: TOKENS.text }}>
            <style>{GLOBAL_STYLES}</style>
            <Navbar
                sessionActions={{
                    onExit: handleExit,
                    exitLabel: isOwner ? "End Session" : "Leave Session",
                    onCopyLink: copyLink,
                }}
            />


            {/* --- MAIN LAYOUT --- */}
            <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 flex flex-col gap-6">

                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-6 w-full md:w-auto p-4 rounded-2xl border bg-[#16181D]" style={{ borderColor: TOKENS.border }}>
                        <div className="flex flex-col">
                            <span className={`${mono.className} text-[10px] text-gray-500 uppercase tracking-widest mb-1`}>Private Session</span>
                            <div className="flex items-center gap-3">
                                <h1 className={`${heading.className} text-3xl font-bold tracking-tight text-white`}>
                                    <span className="tabular-nums tracking-wider">{currentSession.codeDisplay}</span>
                                </h1>
                                <button onClick={copyLink} className="p-1.5 rounded-lg bg-white/5 hover:bg-[#DFFF00] hover:text-black transition-colors" title="Copy Link">
                                    <Copy size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="h-10 w-px bg-white/10 mx-2 hidden sm:block" />
                        <div className="flex flex-col hidden sm:flex">
                            <span className={`${mono.className} text-[10px] text-gray-500 uppercase tracking-widest mb-1`}>Session Ends In</span>
                            <div className="flex items-center gap-2 text-sm font-medium font-mono text-[#DFFF00]">
                                <Clock size={14} />
                                <span className="tabular-nums">{formatTime(timeLeft)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border bg-[#DFFF00]/5 border-[#DFFF00]/10 text-[10px] font-bold tracking-widest text-[#DFFF00] uppercase">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#DFFF00] animate-pulse" />
                            Live Session
                        </div>

                        <button onClick={handleExit} className={`h-12 px-6 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${isOwner ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40" : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white"}`}>
                            {isOwner ? <Trash2 size={16} /> : <LogOut size={16} />}
                            {isOwner ? "End Session" : "Leave Session"}
                        </button>


                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[calc(100vh-220px)]">

                    {/* LEFT COLUMN: FILES */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                            onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`relative shrink-0 rounded-[32px] border-2 border-dashed p-6 lg:p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group overflow-hidden ${isDragging ? "border-[#DFFF00] bg-[#DFFF00]/5 scale-[1.01]" : "border-white/10 bg-[#16181D]/40 hover:border-white/20 hover:bg-[#16181D]"}`}
                        >
                            <input type="file" multiple ref={fileInputRef} className="hidden" onChange={(e) => processFiles(Array.from(e.target.files))} />
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 shadow-xl z-10 ${isDragging ? "bg-[#DFFF00] scale-110 rotate-12" : "bg-[#1E2128] border border-white/10 group-hover:scale-110 group-hover:border-[#DFFF00]"}`}>
                                <Upload size={28} className={`transition-colors duration-300 ${isDragging ? "text-black" : "text-[#DFFF00]"}`} />
                            </div>
                            <div className="z-10">
                                <h3 className={`${heading.className} text-xl font-bold text-white group-hover:text-[#DFFF00] transition-colors`}>{isDragging ? "Drop to Upload" : "Upload Files"}</h3>
                                <p className={`${mono.className} text-xs text-gray-500 uppercase tracking-widest mt-1`}>Drag & drop or click to browse</p>
                            </div>
                        </motion.div>

                        {/* 2. FILE LIST CONTAINER */}
                        {/* FIX: Increased min-h to 500px so content fits on laptops without scrollbar inside box */}
                        <div className="bg-[#16181D] border border-white/5 rounded-[32px] overflow-hidden flex flex-col shadow-2xl h-[500px] lg:h-[calc(100vh-400px)] min-h-[500px]">
                            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#16181D] sticky top-0 z-20">
                                <div className="flex items-center gap-2">
                                    <Activity size={16} className="text-[#DFFF00]" />
                                    <span className={`${mono.className} text-[10px] font-bold uppercase tracking-widest text-gray-400`}>Transfers</span>
                                </div>
                                <div className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] font-mono text-[#DFFF00]">{files.length} Files</div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                {files.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-6">
                                        <div className="bg-white p-3 rounded-2xl shadow-2xl mb-6"><QRCodeSVG value={joinLink} size={140} /></div>
                                        <h3 className={`${heading.className} text-xl font-bold text-white mb-2`}>Ready to Receive</h3>
                                        <p className="text-gray-500 text-sm max-w-xs leading-relaxed">Scan to join this session.</p>
                                        <div className="flex gap-4 mt-8">
                                            <div className="flex items-center gap-2 text-xs text-gray-600 font-mono"><Smartphone size={14} /><span>MOBILE</span></div>
                                            <div className="w-px h-4 bg-white/10" />
                                            <div className="flex items-center gap-2 text-xs text-gray-600 font-mono"><Monitor size={14} /><span>DESKTOP</span></div>
                                        </div>
                                    </div>
                                ) : (
                                    <AnimatePresence mode="popLayout">
                                        {files.map(file => (
                                            <motion.div key={file.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="group relative flex items-center justify-between p-4 rounded-xl bg-[#0E0F12] border border-white/5 hover:border-[#DFFF00]/30 transition-all duration-300">
                                                {file.status === 'uploading' && <div className="absolute inset-0 bg-[#DFFF00]/5 z-0 transition-all duration-300" style={{ width: `${file.progress}%` }} />}
                                                <div className="flex items-center gap-4 min-w-0 z-10">
                                                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/5"><GetFileIcon fileName={file.name} /></div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-white truncate max-w-[150px] sm:max-w-xs">{file.name}</p>
                                                        <div className="flex items-center gap-2 mt-1"><span className={`${mono.className} text-[10px] text-gray-500`}>{formatFileSize(file.size)}</span>{file.status === 'uploading' && <span className={`${mono.className} text-[10px] text-[#DFFF00] animate-pulse`}>UPLOADING...</span>}</div>
                                                    </div>
                                                </div>
                                                <div className="z-10 ml-2">
                                                    {file.status === 'uploading' ? <Loader2 size={18} className="text-[#DFFF00] animate-spin" /> : file.downloadedByMe ? <CheckCircle size={18} className="text-[#DFFF00]" /> : <button onClick={() => downloadFile(file.id)} className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-[#DFFF00] hover:text-black transition-all"><Download size={18} /></button>}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: COMMS LOG */}
                    {/* FIX: Removed explicit height calculation. h-full forces it to stretch to the height of the Left Column (which is defined by Dropzone + FileList). */}
                    <div className="hidden lg:flex lg:col-span-4 flex-col h-full min-h-0">
                        <div className="flex-1 min-h-0 bg-[#16181D] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
                            <ChatContent notes={notes} myParticipantId={myParticipantId} participantNameMap={participantNameMap} noteInput={noteInput} setNoteInput={setNoteInput} handleSendNote={handleSendNote} isGuest={isGuest} router={router} code={code} notesEndRef={notesEndRef} />
                        </div>
                    </div>

                    {/* MOBILE BUTTON & DRAWER */}
                    <div className="lg:hidden fixed bottom-6 right-6 z-50">
                        <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => setIsChatOpen(true)} className="flex items-center gap-2 px-6 py-4 bg-[#DFFF00] text-black font-bold rounded-full shadow-[0_0_30px_rgba(223,255,0,0.3)] hover:bg-[#ccee00] transition-all active:scale-95">
                            <MessageSquare size={20} fill="black" />
                            <span className="text-sm uppercase tracking-widest">Notes</span>
                        </motion.button>
                    </div>

                    <AnimatePresence>
                        {isChatOpen && (
                            <>
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsChatOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 lg:hidden" />
                                <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed bottom-0 left-0 right-0 h-[85vh] z-50 lg:hidden bg-[#16181D] rounded-t-[32px] border-t border-white/10 overflow-hidden shadow-2xl flex flex-col">
                                    <ChatContent notes={notes} myParticipantId={myParticipantId} participantNameMap={participantNameMap} noteInput={noteInput} setNoteInput={setNoteInput} handleSendNote={handleSendNote} isGuest={isGuest} router={router} code={code} notesEndRef={notesEndRef} closeDrawer={() => setIsChatOpen(false)} />
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
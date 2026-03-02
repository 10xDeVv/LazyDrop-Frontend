"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import PricingCard from "@/components/PricingCard";
import {
    ArrowRight,
    ArrowDown,
    Sparkles,
    Upload,
    QrCode,
    Shield,
    Zap,
    Clock,
    Users,
    School,
    Share2,
    Linkedin,
    Github,
    MessageSquare,
    Check,
    Lock,
    File,
    Laptop,
    Smartphone,
    Image as ImageIcon
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { Space_Grotesk, Inter } from "next/font/google";

const heading = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });
const body = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });

// ---- Tokens
const TOKENS = {
    bg: "#0E0F12",
    panel: "#16181D",
    panel2: "#1C1F26",
    text: "#F5F5F5",
    muted: "#9CA3AF",
    dim: "#6B7280",
    line: "rgba(255,255,255,0.10)",
    line2: "rgba(255,255,255,0.14)",
    lime: "#DFFF00", // acid lime
    cyan: "rgba(93,224,255,0.85)",
};

// ---------- Typewriter code
function TypewriterCode() {
    const codes = useMemo(() => ["LD-482-019", "LD-905-771", "LD-112-604", "LD-738-255"], []);
    const [displayed, setDisplayed] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [idx, setIdx] = useState(0);

    useEffect(() => {
        const current = codes[idx];
        const speed = isDeleting ? 55 : 90;
        const pause = 1400;

        const t = setTimeout(() => {
            if (!isDeleting) {
                if (displayed.length < current.length) setDisplayed(current.slice(0, displayed.length + 1));
                else setTimeout(() => setIsDeleting(true), pause);
            } else {
                if (displayed.length > 0) setDisplayed(current.slice(0, displayed.length - 1));
                else {
                    setIsDeleting(false);
                    setIdx((p) => (p + 1) % codes.length);
                }
            }
        }, speed);

        return () => clearTimeout(t);
    }, [codes, displayed, isDeleting, idx]);

    return (
        <div className="inline-flex items-center gap-2">
            <div className="px-4 py-2 rounded-2xl border" style={{ borderColor: TOKENS.line, background: "rgba(255,255,255,0.04)" }}>
                <span className="font-mono text-lg md:text-xl tracking-[0.22em]" style={{ color: TOKENS.text }}>
                    {displayed || "LD-"}
                </span>
                <span className="ml-1 animate-pulse" style={{ color: TOKENS.lime }}>|</span>
            </div>
        </div>
    );
}

// ---------- Rotating circle with Down Arrow
function ScrollDownSpinner() {
    return (
        <div className="relative w-32 h-32 flex items-center justify-center cursor-pointer group">
            {/* The Spinning Text */}
            <div className="absolute inset-0 animate-[spin_10s_linear_infinite]">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path
                        id="circlePath"
                        d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                        fill="transparent"
                    />
                    <text className="text-[10px] font-bold uppercase tracking-widest fill-white/50 group-hover:fill-white transition-colors">
                        <textPath href="#circlePath" startOffset="0%">
                            • SCROLL DOWN • DISCOVER • LAZYDROP •
                        </textPath>
                    </text>
                </svg>
            </div>

            {/* The Arrow Center */}
            <div
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{ background: TOKENS.lime, boxShadow: `0 0 20px ${TOKENS.lime}40` }}
            >
                <ArrowDown className="w-5 h-5 text-black animate-bounce" />
            </div>
        </div>
    );
}

// ---------- Session Visual (FIXED: Bigger QR + Working Glow)
function SessionVisual() {
    return (
        <div className="relative group">
            {/* Background Glows */}
            <div className="absolute -top-16 -right-10 w-72 h-72 rounded-full blur-3xl opacity-35" style={{ background: `radial-gradient(circle, ${TOKENS.lime} 0%, transparent 60%)` }} />
            <div className="absolute -bottom-16 -left-10 w-72 h-72 rounded-full blur-3xl opacity-25" style={{ background: `radial-gradient(circle, ${TOKENS.cyan} 0%, transparent 60%)` }} />

            <div
                className="relative rounded-[28px] border overflow-hidden shadow-2xl backdrop-blur-sm"
                style={{
                    borderColor: TOKENS.line,
                    background: `linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))`,
                }}
            >
                {/* Top Bar */}
                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: TOKENS.line }}>
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor] animate-pulse" style={{ background: TOKENS.lime, color: TOKENS.lime }} />
                        <span className="text-xs uppercase tracking-[0.22em] font-medium" style={{ color: TOKENS.dim }}>Live Session</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono" style={{ color: TOKENS.dim }}>
                        <Lock className="w-3 h-3" />
                        <span>SECURE SESSION</span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 space-y-8">

                    {/* Header Row: Code & QR */}
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                            <p className="text-xs uppercase tracking-widest mb-3 font-semibold" style={{ color: TOKENS.dim }}>Connection Key</p>
                            <div className="mb-5">
                                <TypewriterCode />
                            </div>

                            {/* Device Pills */}
                            <div className="flex flex-wrap gap-2">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium" style={{ borderColor: TOKENS.line, background: "rgba(255,255,255,0.05)", color: TOKENS.muted }}>
                                    <Laptop className="w-3 h-3" />
                                    <span>MacBook Pro</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium" style={{ borderColor: "rgba(223,255,0,0.2)", background: "rgba(223,255,0,0.1)", color: TOKENS.lime }}>
                                    <Smartphone className="w-3 h-3" />
                                    <span>iPhone 15</span>
                                </div>
                            </div>
                        </div>

                        {/* BIGGER QR Code container */}
                        <div className="p-3 bg-white rounded-2xl shadow-xl transform rotate-2 hover:rotate-0 transition-transform duration-300">
                            <QrCode className="w-20 h-20 md:w-24 md:h-24 text-black" strokeWidth={1.5} />
                        </div>
                    </div>

                    {/* Drag & Drop Zone (FIXED: Hover Glow) */}
                    <div
                        className="groupdrop relative rounded-2xl border-2 border-dashed p-8 flex flex-col items-center text-center transition-all duration-300 hover:scale-[1.01] cursor-pointer"
                        style={{ borderColor: TOKENS.line, background: "rgba(0,0,0,0.2)" }}
                    >
                        {/* CSS trick for hover border color since inline styles override tailwind classes sometimes */}
                        <style jsx>{`
                            .groupdrop:hover {
                                border-color: ${TOKENS.lime} !important;
                                background-color: rgba(223, 255, 0, 0.05) !important;
                            }
                        `}</style>

                        <div
                            className="w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-lg transition-transform group-hover/drop:scale-110 group-hover/drop:shadow-[0_0_20px_rgba(223,255,0,0.2)]"
                            style={{ background: "#181818", border: `1px solid ${TOKENS.line}` }}
                        >
                            <Upload className="w-6 h-6 transition-colors group-hover/drop:text-[#DFFF00]" style={{ color: TOKENS.lime }} />
                        </div>
                        <p className="text-base font-medium relative z-10 transition-colors group-hover/drop:text-white" style={{ color: TOKENS.text }}>Drop files to send</p>
                        <p className="text-xs relative z-10" style={{ color: TOKENS.dim }}>or click to browse</p>
                    </div>

                    {/* Active Transfers */}
                    <div className="space-y-3">
                        <p className="text-xs font-bold uppercase tracking-wide" style={{ color: TOKENS.dim }}>Recent Transfers</p>

                        {/* File 1 */}
                        <div className="flex items-center justify-between p-3 rounded-xl border transition-colors hover:bg-white/5 hover:border-white/20" style={{ background: "#181818", borderColor: TOKENS.line }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#F87171" }}>
                                    <File className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium" style={{ color: TOKENS.text }}>lecture-notes.pdf</p>
                                    <p className="text-xs" style={{ color: TOKENS.dim }}>4.2 MB • PDF</p>
                                </div>
                            </div>
                            <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ background: TOKENS.lime, color: TOKENS.lime }} />
                        </div>

                        {/* File 2 */}
                        <div className="flex items-center justify-between p-3 rounded-xl border transition-colors hover:bg-white/5 hover:border-white/20" style={{ background: "#181818", borderColor: TOKENS.line }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(59, 130, 246, 0.1)", color: "#60A5FA" }}>
                                    <ImageIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium" style={{ color: TOKENS.text }}>design-mockup.png</p>
                                    <p className="text-xs" style={{ color: TOKENS.dim }}>12 MB • PNG</p>
                                </div>
                            </div>
                            <Check className="w-4 h-4" style={{ color: TOKENS.lime }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ---------- Hero
function Hero() {
    return (
        <section className="relative pt-32 pb-20 overflow-hidden flex flex-col items-center min-h-[90vh] justify-center">
            {/* ... (Backgrounds remain unchanged) ... */}
            <div className="absolute inset-0 opacity-[0.75] pointer-events-none"
                 style={{
                     background: `
            radial-gradient(1200px 600px at 20% 10%, rgba(255,255,255,0.06), transparent 60%),
            radial-gradient(900px 500px at 80% 30%, rgba(223,255,0,0.12), transparent 60%),
            radial-gradient(800px 500px at 50% 90%, rgba(93,224,255,0.08), transparent 60%)
          `,
                 }}
            />
            <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(180deg, transparent, ${TOKENS.bg} 90%)` }} />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-20 w-full">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* Left Content */}
                    <div className="text-left relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border backdrop-blur mb-6"
                            style={{ borderColor: TOKENS.line, background: "rgba(255,255,255,0.04)" }}
                        >
                            <Sparkles className="w-4 h-4" style={{ color: TOKENS.lime }} />
                            <span className="text-xs sm:text-sm" style={{ color: TOKENS.muted }}>The frictionless way to move data.</span>
                        </motion.div>

                        {/* --- FIXED HEADLINE --- */}
                        <motion.h1
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                            className={`text-5xl sm:text-6xl md:text-7xl lg:text-[4.6rem] xl:text-[5.5rem] leading-[0.95] tracking-tight ${heading.className}`}
                            style={{ color: TOKENS.text }}
                        >
                            FROM THIS DEVICE
                            <br />
                            <span className="whitespace-nowrap"> {/* Forces "TO THAT ONE." to stay on one line if space permits */}
                                TO <span style={{ color: TOKENS.lime }}>THAT ONE.</span>
                            </span>
                            <br />
                            IN <span style={{ color: "rgba(255,255,255,0.65)" }}>SECONDS.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.12 }}
                            className={`mt-6 text-base sm:text-lg lg:text-xl ${body.className}`}
                            style={{ color: TOKENS.muted, maxWidth: 540 }}
                        >
                            No setup. No friction. <br className="hidden sm:block" />
                            Scan a QR, drop the file, and share instantly across devices.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.18 }}
                            className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
                        >
                            <Link href="/drop" className="group px-8 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition"
                                  style={{ background: TOKENS.lime, color: "#0B0C0F", boxShadow: "0 10px 30px rgba(223,255,0,0.18)" }}
                            >
                                Drop Files Now
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                            </Link>

                            <Link href="#how-it-works" className="px-8 py-4 rounded-2xl font-semibold text-center transition border hover:bg-white/5"
                                  style={{ borderColor: TOKENS.line2, color: TOKENS.text }}
                            >
                                How it Works
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.24 }}
                            className="mt-3 text-xs sm:text-sm"
                            style={{ color: TOKENS.dim }}
                        >
                            No signup required. Create an account only for history.
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.28 }}
                            className="mt-8 flex flex-wrap items-center gap-2"
                        >
                            <span className="text-xs sm:text-sm mr-2" style={{ color: TOKENS.dim }}>
                                Works on
                            </span>

                            {["Mac", "Windows", "iOS", "Android", "Linux"].map((p) => (
                                <span
                                    key={p}
                                    className="inline-flex items-center px-3 py-1.5 rounded-full border text-xs sm:text-sm font-medium"
                                    style={{
                                        borderColor: TOKENS.line2,
                                        background: "rgba(255,255,255,0.03)",
                                        color: TOKENS.text,
                                    }}
                                >
                                    {p}
                                </span>
                            ))}
                        </motion.div>

                    </div>

                    {/* Right Visual */}
                    <motion.div
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15, duration: 0.7 }}
                        className="hidden lg:block relative z-10"
                    >
                        <SessionVisual />
                    </motion.div>
                </div>

                {/* The Spinner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex justify-center mt-20 sm:mt-24 lg:mt-32"
                >
                    <Link href="#use-cases">
                        <ScrollDownSpinner />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}

function UseCases() {
    const cases = [
        {
            icon: <School className="w-6 h-6 text-[#DFFF00]" />,
            title: "The Campus Hustle",
            desc: "Working on a school library computer? Need a pic from your phone to your slide deck? Don't email yourself. Just Drop it."
        },
        {
            icon: <Share2 className="w-6 h-6 text-[#DFFF00]" />,
            title: "The Group Project",
            desc: "iPhone, Android, Windows laptop... doesn't matter. Everyone joins the same room. Anyone can send. Anyone can receive."
        },
        {
            icon: <MessageSquare className="w-6 h-6 text-[#DFFF00]" />,
            title: "Built-in Coordination",
            desc: "Stop switching apps to say 'Send the textbook'. Use session notes to coordinate file swaps right where the files are."
        }
    ];

    return (
        <section id="use-cases" className="py-20 relative border-t border-b" style={{ borderColor: TOKENS.line, background: "rgba(255,255,255,0.02)" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-20">
                <SectionHeader
                    title="Built for moments like this"
                    subtitle=" When AirDrop isn’t available and Drive feels like overhead, LazyDrop is instant."
                />
                <div className="grid md:grid-cols-3 gap-8">
                    {cases.map((c, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="flex flex-col gap-4"
                        >
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-2">
                                {c.icon}
                            </div>
                            <h3 className={`${heading.className} text-xl font-bold text-white`}>{c.title}</h3>
                            <p className={`${body.className} text-gray-400 text-sm leading-relaxed`}>{c.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function SectionHeader({ title, subtitle }) {
    return (
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
            <h2 className={`${heading.className} text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold`} style={{ color: TOKENS.text }}>
                {title}
            </h2>
            {subtitle ? (
                <p className={`${body.className} mt-4 text-base sm:text-lg`} style={{ color: TOKENS.muted, maxWidth: 680, marginInline: "auto" }}>
                    {subtitle}
                </p>
            ) : null}
        </div>
    );
}

// ---------- Bento Grid
function BentoHowItWorks() {
    return (
        <section id="how-it-works" className="py-20 lg:py-32">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-20">
                <div className="mb-12 sm:mb-16">
                    <h2 className={`${heading.className} text-4xl sm:text-5xl md:text-7xl leading-[0.95]`} style={{ color: TOKENS.text }}>
                        ZERO <span style={{ color: "rgba(255,255,255,0.55)" }}>FRICTION.</span>
                        <br />
                        JUST <span style={{ color: TOKENS.lime }}>FLOW.</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:auto-rows-[minmax(0,1fr)]">
                    {/* Card 1: Scan (Abstract Phone UI) */}
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative overflow-hidden rounded-[32px] border p-8 md:row-span-2 flex flex-col justify-between group min-h-[400px]"
                        style={{ borderColor: TOKENS.line, background: `linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))` }}
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 blur-[80px] rounded-full transition-opacity opacity-20 group-hover:opacity-40" style={{ background: TOKENS.lime }} />

                        <div>
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg" style={{ background: "white", color: "#0B0C0F" }}>
                                <QrCode size={32} strokeWidth={2.5} />
                            </div>
                            <h3 className={`${heading.className} text-3xl sm:text-4xl`} style={{ color: TOKENS.text }}>Scan &<br />Connect</h3>
                            <p className={`${body.className} mt-4 text-lg`} style={{ color: TOKENS.muted }}>
                                No account needed. Scan a QR or enter a code to connect.
                                Start in seconds.
                            </p>
                        </div>

                        {/* Abstract Phone UI */}
                        <div className="mt-8 relative w-full h-48 rounded-t-3xl border-t border-x mx-auto transform translate-y-4" style={{ background: "#222", borderColor: TOKENS.line }}>
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-white/20" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <QrCode className="text-white/20 w-20 h-20" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 2: Speed (Bar Chart Animation) */}
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.06 }}
                        className="relative overflow-hidden rounded-[32px] border p-8 md:col-span-2 flex flex-col md:flex-row items-center justify-between gap-8 group min-h-[300px]"
                        style={{ borderColor: TOKENS.line, background: `linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))` }}
                    >
                        <div className="relative z-10 flex-1">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: TOKENS.lime, color: "#0B0C0F" }}>
                                <Zap size={32} strokeWidth={2.5} />
                            </div>
                            <h3 className={`${heading.className} text-3xl sm:text-4xl`} style={{ color: TOKENS.text }}>Instant Transfer</h3>
                            <p className={`${body.className} mt-4 text-lg`} style={{ color: TOKENS.muted, maxWidth: 520 }}>
                                Upload straight from your browser. No “send it to myself” nonsense. Your connection is the only limit.
                            </p>
                        </div>

                        {/* Bar Chart Animation */}
                        <div className="relative z-10 w-full md:w-80 h-32 flex items-end justify-between gap-2">
                            {[40, 70, 50, 90, 60, 80].map((h, i) => (
                                <motion.div
                                    key={i}
                                    className="rounded-t-lg w-full"
                                    initial={{ height: "20%" }}
                                    whileInView={{ height: `${h}%` }}
                                    transition={{ duration: 0.8, delay: i * 0.1, repeat: Infinity, repeatType: "reverse" }}
                                    style={{ background: h > 60 ? TOKENS.lime : "rgba(255,255,255,0.1)" }}
                                />
                            ))}
                        </div>
                    </motion.div>

                    {/* Card 3: Secure */}
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.12 }}
                        className="rounded-[32px] border p-8 relative overflow-hidden min-h-[300px] flex flex-col justify-center"
                        style={{ borderColor: TOKENS.line, background: "rgba(255,255,255,0.03)" }}
                    >
                        <Shield className="w-14 h-14 mb-6" style={{ color: TOKENS.lime }} />
                        <h3 className={`${heading.className} text-3xl`} style={{ color: TOKENS.text }}>Encrypted</h3>
                        <p className={`${body.className} mt-3 text-base text-gray-400`} style={{ color: TOKENS.muted }}>
                            Your data never lives permanently on our servers. It’s just between you and your other device.
                        </p>
                    </motion.div>

                    {/* Card 4: Devices */}
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.18 }}
                        className="rounded-[32px] border p-8 relative overflow-hidden flex flex-col justify-center items-center text-center min-h-[300px]"
                        style={{ borderColor: TOKENS.line, background: "rgba(255,255,255,0.03)" }}
                    >
                        <div className="flex -space-x-4 mb-6">
                            <div className="w-16 h-16 rounded-full border flex items-center justify-center bg-[#222]" style={{ borderColor: "#333", color: TOKENS.muted }}>
                                <Laptop size={28} />
                            </div>
                            <div className="w-16 h-16 rounded-full border flex items-center justify-center font-bold" style={{ background: TOKENS.lime, borderColor: "#333", color: "#0B0C0F" }}>
                                <Smartphone size={28} />
                            </div>
                        </div>
                        <h3 className={`${heading.className} text-3xl`} style={{ color: TOKENS.text }}>Cross Platform</h3>
                        <p className={`${body.className} mt-3 text-base`} style={{ color: TOKENS.muted }}>
                            iOS, Android, Mac, Windows, Linux—if it has a browser, it works.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}


function Features() {
    const features = [
        { icon: <Zap className="w-6 h-6" />, title: "Instant transfer", description: "Pair + send in seconds. Feels like magic (it’s engineering)." },
        { icon: <Shield className="w-6 h-6" />, title: "Secure by default", description: "Encrypted transfers. Sessions expire. No permanent storage." },
        { icon: <Clock className="w-6 h-6" />, title: "No waiting", description: "No unnecessary steps. No clutter. Just the file moving." },
        { icon: <Users className="w-6 h-6" />, title: "Any device", description: "Phone ↔ laptop ↔ tablet. If it has a browser, it works." },
    ];

    return (
        <section id="features" className="py-20 lg:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-20">
                <SectionHeader title="Why people love it" subtitle="Minimal UX, maximum throughput." />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((f, i) => (
                        <motion.div
                            key={f.title}
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08 }}
                            className="rounded-[24px] border p-8 hover:bg-white/5 transition-colors"
                            style={{ borderColor: TOKENS.line, background: "rgba(255,255,255,0.02)" }}
                        >
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{ background: "rgba(223,255,0,0.1)", color: TOKENS.lime }}>
                                {f.icon}
                            </div>
                            <h3 className={`${heading.className} text-xl font-bold`} style={{ color: TOKENS.text }}>
                                {f.title}
                            </h3>
                            <p className={`${body.className} mt-3 text-sm leading-relaxed`} style={{ color: TOKENS.muted }}>
                                {f.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}


function Pricing() {
    const plans = [
        {
            name: "Casual",
            price: "0",
            description: "For the occasional drop.",
            features: ["Up to 100MB per file", "15 min Session Duration", "5 Files per Session", "Standard Speed"],
            cta: "Start Free",
            href: "/drop",
            popular: false,
        },
        {
            name: "Plus",
            price: "9.99",
            description: "More power, more time.",
            features: ["Up to 1GB per file", "60 min Session Duration", "50 Files per Session", "Priority Speed"],
            cta: "Get Plus",
            href: "/pricing",
            popular: true, // ✅ NOW POPULAR
        },
        {
            name: "Pro",
            price: "19.99",
            description: "For heavy duty transfer.",
            features: ["2 GB per file limit", "120 min Session Duration", "75 Files per Session", "Max Speed"],
            cta: "Go Pro",
            href: "/pricing",
            popular: false, // ✅ STANDARD
        }
    ];

    return (
        <section id="pricing" className="py-24 relative overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className={`${heading.className} text-4xl md:text-5xl lg:text-6xl font-bold mb-6`} style={{ color: TOKENS.text }}>
                        SIMPLE PRICING.
                    </h2>
                    <p className={`${body.className} text-xl`} style={{ color: TOKENS.muted }}>
                        Start free. Upgrade when your workflow needs more.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                    {plans.map((plan) => (
                        <PricingCard key={plan.name} plan={plan} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function FAQ() {
    const faqs = [
        { q: "Do I need an account?", a: "No. Free drops work instantly. Create an account only if you want history, larger files, and Plus features." },
        { q: "Is it secure?", a: "Transfers use encrypted, signed links and sessions expire automatically. Simple, fast, and secure by design." },
        { q: "What’s the file size limit?", a: "Free: up to 100MB per file. Plus: up to 1GB. Pro: up to 2GB." },
        { q: "Can I cancel Plus?", a: "Anytime. No contracts." },
    ];

    return (
        <section id="faq" className="py-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-20">
                <SectionHeader title="FAQ" subtitle="Quick answers. Then go drop files." />
                <div className="space-y-4">
                    {faqs.map((f, i) => (
                        <motion.div
                            key={f.q}
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.06 }}
                            className="rounded-[24px] border p-8"
                            style={{ borderColor: TOKENS.line, background: "rgba(255,255,255,0.02)" }}
                        >
                            <h3 className={`${heading.className} text-xl`} style={{ color: TOKENS.text }}>{f.q}</h3>
                            <p className={`${body.className} mt-3 text-base leading-relaxed`} style={{ color: TOKENS.muted }}>{f.a}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function Footer() {
    return (
        <footer className="border-t relative overflow-hidden" style={{ borderColor: TOKENS.line }}>
            {/* Background Glow for Footer */}
            <div className="absolute bottom-0 left-0 w-[500px] h-[300px] bg-[#DFFF00]/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-20 py-20">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 mb-16">

                    {/* LEFT COLUMN: Brand + Founder Signature */}
                    <div className="flex flex-col items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-17 h-17 relative">
                                    <Image
                                        src="/logo.png"
                                        alt="LazyDrop"
                                        fill
                                        className="object-contain rounded-xl"
                                    />
                                </div>
                            </div>
                            <p className={`${body.className} text-gray-400 text-sm leading-relaxed max-w-sm mb-10`}>
                                The simplest way to move files between devices. No drive, no clutter—just fast, secure transfer sessions.
                            </p>
                        </div>

                        {/* --- FOUNDER SIGNATURE CARD --- */}
                        <div className="relative group">
                            <div className="absolute inset-0 bg-[#DFFF00] blur-xl opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                            <div className="relative flex flex-col gap-3 p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#DFFF00]/30 transition-all duration-300">
                                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Built & Designed by</p>

                                <div className="flex items-center gap-4">
                                    {/* Avatar / Placeholder */}
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                                        W
                                    </div>

                                    <div>
                                        <p className="text-white font-bold text-sm">Adebowale Adebayo</p>
                                        <p className="text-xs text-[#DFFF00]">Founder & Engineer</p>
                                    </div>

                                    <div className="h-8 w-px bg-white/10 mx-2" />

                                    <div className="flex gap-2">
                                        <a
                                            href="https://github.com/10xDeVv"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 rounded-lg bg-black/20 text-gray-400 hover:text-white hover:bg-black/40 transition-colors"
                                            title="GitHub"
                                        >
                                            <Github size={16} />
                                        </a>
                                        <a
                                            href="https://www.linkedin.com/in/waally-7707xyz"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 rounded-lg bg-black/20 text-gray-400 hover:text-[#0077b5] hover:bg-black/40 transition-colors"
                                            title="LinkedIn"
                                        >
                                            <Linkedin size={16} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="md:pl-12 pt-4">
                        <h4 className={`${heading.className} font-bold text-white text-lg mb-6`}>Product</h4>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/drop" className="group flex items-center gap-3 text-gray-400 hover:text-[#DFFF00] transition-colors">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-[#DFFF00] transition-colors" />
                                    Send a File
                                </Link>
                            </li>
                            <li>
                                <Link href="/join" className="group flex items-center gap-3 text-gray-400 hover:text-[#DFFF00] transition-colors">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-[#DFFF00] transition-colors" />
                                    Receive a File
                                </Link>
                            </li>
                            <li>
                                <Link href="/pricing" className="group flex items-center gap-3 text-gray-400 hover:text-[#DFFF00] transition-colors">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-[#DFFF00] transition-colors" />
                                    Pricing & Plans
                                </Link>
                            </li>
                            <li>
                                <a href="mailto:hello@lazydrop.com" className="group flex items-center gap-3 text-gray-400 hover:text-[#DFFF00] transition-colors">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-[#DFFF00] transition-colors" />
                                    Support
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
                    <p>© 2026 LazyDrop. All rights reserved.</p>
                    <p className="flex items-center gap-1">
                        Crafted in Canada 🇨🇦
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default function Home() {
    return (
        <div className={`${body.className} min-h-screen`} style={{ background: TOKENS.bg, color: TOKENS.text }}>
            <Navbar />
            <Hero />
            <UseCases/>
            <BentoHowItWorks />
            <Features />
            <Pricing />
            <FAQ />
            <Footer />
        </div>
    );
}
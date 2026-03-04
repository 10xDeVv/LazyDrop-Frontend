"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    ArrowLeft, Server, Database, Globe, Smartphone, Shield, Zap,
    FileJson, Cpu, Layers, ArrowDown, Activity, Terminal, Cloud,
    AlertTriangle, Code2, Box
} from "lucide-react";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import Mermaid from "@/components/Mermaid";

// --- FONTS ---
const heading = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"] });
const body = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });
const mono = JetBrains_Mono({ subsets: ["latin"] });

// --- TOKENS ---
const TOKENS = {
    bg: "#0E0F12",
    panel: "#16181D",
    border: "rgba(255,255,255,0.1)",
    lime: "#DFFF00",
    text: "#F5F5F5",
    muted: "#9CA3AF",
};

// --- MERMAID DIAGRAMS ---
const PROD_VS_LOCAL = `
flowchart TB
  subgraph Local_Dev["Local Dev (Docker Compose)"]
    LFE["Next.js (Docker)"]
    LBE["Spring Boot (Docker)"]
    LDB[("Postgres (Docker)")]
    LFE -->|"REST / WS"| LBE
    LBE -->|"JPA/Flyway"| LDB
  end

  subgraph Production["Production (Live)"]
    PFE["Vercel (Next.js)"]
    PBE["DigitalOcean (Spring Boot)"]
    PDB[("Managed Postgres")]
    SB["Supabase (Auth + Storage)"]
    ST["Stripe (Billing + Webhooks)"]

    PFE -->|"REST / WS"| PBE
    PBE -->|"JPA/Flyway"| PDB
    PFE -->|"JWT login"| SB
    PBE -->|"JWT validate + signed URLs"| SB
    PFE -->|"Checkout"| ST
    ST -->|"Webhooks"| PBE
  end
`;

const STRIPE_WEBHOOK_STATE = `
stateDiagram-v2
  [*] --> RECEIVED

  RECEIVED --> DUPLICATE : event_id already exists
  DUPLICATE --> [*]

  RECEIVED --> PENDING : stored in stripe_webhook_events
  PENDING --> PROCESSING : handler starts

  PROCESSING --> PROCESSED : success
  PROCESSING --> FAILED : exception / downstream error

  FAILED --> RETRY_SCHEDULED : attempt_count++ + next_retry_at
  RETRY_SCHEDULED --> PROCESSING : retry time reached

  PROCESSED --> [*]
`;

const ER_DIAGRAM = `
erDiagram
  users ||--o{ subscriptions : has
  users ||--o{ drop_session : owns
  drop_session ||--o{ drop_session_participants : includes
  drop_session_participants ||--o{ drop_session_note : writes
  drop_session ||--o{ drop_file : contains
  drop_session_participants ||--o{ drop_file_download : downloads
  drop_file ||--o{ drop_file_download : has

  users {
    UUID id PK
    UUID supabase_user_id
    VARCHAR email
    BOOLEAN guest
    VARCHAR guest_id
    TIMESTAMPTZ created_at
  }

  subscriptions {
    UUID id PK
    UUID user_id FK
    VARCHAR stripe_customer_id
    VARCHAR stripe_subscription_id
    VARCHAR plan_code
    VARCHAR status
    TIMESTAMPTZ current_period_end
    BOOLEAN cancel_at_period_end
  }

  drop_session {
    UUID id PK
    UUID owner_id FK
    VARCHAR code
    TIMESTAMPTZ created_at
    TIMESTAMPTZ expires_at
    TIMESTAMPTZ ended_at
    VARCHAR status
    VARCHAR end_reason
  }

  drop_session_participants {
    UUID id PK
    UUID drop_session_id FK
    UUID user_id FK
    VARCHAR role
    TIMESTAMPTZ joined_at
    TIMESTAMPTZ disconnected_at
    BOOLEAN auto_download
  }

  drop_file {
    UUID id PK
    UUID drop_session_id FK
    UUID uploader FK
    VARCHAR storage_path
    VARCHAR original_name
    BIGINT size_bytes
    TIMESTAMPTZ created_at
  }

  drop_file_download {
    UUID id PK
    UUID file_id FK
    UUID participant_id FK
    TIMESTAMPTZ downloaded_at
  }

  stripe_webhook_events {
    UUID id PK
    VARCHAR stripe_event_id
    VARCHAR type
    BOOLEAN livemode
    TIMESTAMPTZ received_at
    TIMESTAMPTZ processed_at
    VARCHAR status
    INTEGER attempt_count
    TIMESTAMPTZ next_retry_at
    TEXT last_error
    TEXT payload
    TEXT sig_header
  }
`;

// --- DIAGRAMS (CUSTOM UI) ---
const ModularMonolithDiagram = () => (
    <div className="w-full p-6 my-8 rounded-xl border border-dashed border-white/20 bg-black/20 flex flex-col items-center gap-6">
        <p className={`text-xs uppercase tracking-widest text-gray-500 font-bold ${heading.className}`}>System Architecture</p>
        <div className="flex gap-4">
            <div className="px-4 py-2 rounded-lg border border-white/10 bg-[#222] text-sm text-gray-300 flex items-center gap-2">
                <Globe size={14} className="text-blue-400" /> Next.js
            </div>
            <div className="px-4 py-2 rounded-lg border border-white/10 bg-[#222] text-sm text-gray-300 flex items-center gap-2">
                <Smartphone size={14} className="text-purple-400" /> Mobile
            </div>
        </div>
        <div className="h-8 w-px bg-white/20 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0E0F12] px-1 text-[10px] text-gray-500">
                WebSocket / REST
            </div>
        </div>
        <div className="relative w-full max-w-md p-6 rounded-2xl border-2 border-[#DFFF00]/50 bg-[#DFFF00]/5 shadow-[0_0_30px_rgba(223,255,0,0.1)]">
            <div className="absolute -top-3 left-6 px-2 bg-[#0E0F12] text-[#DFFF00] text-xs font-bold border border-[#DFFF00]/30 rounded">
                Spring Boot Monolith
            </div>
            <div className="grid grid-cols-2 gap-3">
                {["Session Core", "Identity Resolver", "File Orchestration", "Billing Engine", "STOMP Broker", "Async Workers"].map((mod) => (
                    <div key={mod} className="p-2 rounded bg-[#0E0F12] border border-white/10 text-xs text-center text-gray-300 font-mono">
                        {mod}
                    </div>
                ))}
            </div>
        </div>
        <div className="h-8 w-px bg-white/20" />
        <div className="flex gap-4">
            <div className="px-4 py-2 rounded-lg border border-blue-500/30 bg-blue-500/10 text-sm text-blue-300 flex items-center gap-2">
                <Database size={14} /> PostgreSQL
            </div>
            <div className="px-4 py-2 rounded-lg border border-green-500/30 bg-green-500/10 text-sm text-green-300 flex items-center gap-2">
                <Server size={14} /> Supabase Storage
            </div>
        </div>
    </div>
);

const UploadFlowDiagram = () => (
    <div className="w-full p-6 my-8 rounded-xl bg-black/20 border border-white/10">
        <p className={`text-xs uppercase tracking-widest text-gray-500 font-bold mb-6 text-center ${heading.className}`}>
            Secure Two-Phase Upload
        </p>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono">
            <div className="flex flex-col items-center gap-2 text-center flex-1">
                <div className="w-8 h-8 rounded-full bg-[#16181D] border border-white/20 flex items-center justify-center text-white">
                    1
                </div>
                <p className="text-gray-400">Request Slot</p>
                <ArrowDown className="md:-rotate-90 text-gray-600" size={16} />
            </div>
            <div className="flex flex-col items-center gap-2 text-center flex-1">
                <div className="w-8 h-8 rounded-full bg-[#16181D] border border-[#DFFF00] text-[#DFFF00] flex items-center justify-center shadow-[0_0_15px_rgba(223,255,0,0.2)]">
                    2
                </div>
                <p className="text-[#DFFF00]">Sign URL</p>
                <ArrowDown className="md:-rotate-90 text-gray-600" size={16} />
            </div>
            <div className="flex flex-col items-center gap-2 text-center flex-1">
                <div className="w-8 h-8 rounded-full bg-[#16181D] border border-white/20 flex items-center justify-center text-white">
                    3
                </div>
                <p className="text-gray-400">Upload Direct</p>
                <ArrowDown className="md:-rotate-90 text-gray-600" size={16} />
            </div>
            <div className="flex flex-col items-center gap-2 text-center flex-1">
                <div className="w-8 h-8 rounded-full bg-[#16181D] border border-white/20 flex items-center justify-center text-white">
                    4
                </div>
                <p className="text-gray-400">Confirm DB</p>
            </div>
        </div>
    </div>
);

// --- SECTIONS DATA ---
const SECTIONS = [
    { id: "intro", title: "The Friction", icon: <AlertTriangle size={18} /> },
    { id: "philosophy", title: "Product Philosophy", icon: <Zap size={18} /> },
    { id: "technologies", title: "Core Technologies", icon: <Cpu size={18} /> },
    { id: "architecture", title: "System Overview", icon: <Layers size={18} /> },
    { id: "identity", title: "Identity & Trust", icon: <Shield size={18} /> },
    { id: "realtime", title: "Distributed State", icon: <Activity size={18} /> },
    { id: "storage", title: "File Protocol", icon: <FileJson size={18} /> },
    { id: "failure", title: "Handling Failure", icon: <Terminal size={18} /> },
    { id: "data-model", title: "Data Model", icon: <Database size={18} /> },
    { id: "future", title: "Roadmap", icon: <Cloud size={18} /> },
];

export default function TechDeepDive() {
    const [activeSection, setActiveSection] = useState("intro");

    useEffect(() => {
        const handleScroll = () => {
            const sections = SECTIONS.map((s) => document.getElementById(s.id));
            const scrollPosition = window.scrollY + 200;

            for (const section of sections) {
                if (section && section.offsetTop <= scrollPosition && section.offsetTop + section.offsetHeight > scrollPosition) {
                    setActiveSection(section.id);
                }
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollTo = (id) => {
        const el = document.getElementById(id);
        if (el) window.scrollTo({ top: el.offsetTop - 100, behavior: "smooth" });
    };

    return (
        <div className={`min-h-screen ${body.className}`} style={{ background: TOKENS.bg, color: TOKENS.text }}>
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 h-16 bg-[#0E0F12]/80 backdrop-blur-md border-b border-white/5 flex items-center px-6 z-50">
                <Link href="/" className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#DFFF00] transition-colors">
                    <ArrowLeft size={14} /> BACK TO APP
                </Link>
                <div className="mx-auto font-mono text-xs text-gray-500 hidden sm:block">
                    ENGINEERING CASE STUDY: LAZYDROP v1.0
                </div>
                <div className="w-20" />
            </div>

            <div className="max-w-[1400px] mx-auto pt-24 px-4 sm:px-6 flex gap-12">
                {/* Sidebar */}
                <div className="hidden lg:block w-64 shrink-0 fixed top-24 left-[max(1rem,calc(50%-700px+1rem))] h-[calc(100vh-6rem)] overflow-y-auto pr-4">
                    <div className="space-y-1">
                        {SECTIONS.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => scrollTo(section.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    activeSection === section.id
                                        ? "bg-[#DFFF00]/10 text-[#DFFF00] border border-[#DFFF00]/20"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                {section.icon}
                                {section.title}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="lg:ml-[280px] w-full max-w-3xl pb-32">
                    {/* INTRO */}
                    <section id="intro" className="mb-20">
                        <h1 className={`${heading.className} text-4xl md:text-6xl font-bold mb-8`}>
                            Building <span className="text-[#DFFF00]">LazyDrop</span>
                        </h1>
                        <p className="text-lg text-gray-300 leading-relaxed mb-6">Some products don’t start as “ideas.” They start as friction.</p>
                        <div className="p-6 rounded-2xl bg-[#16181D] border border-white/10 italic text-gray-400">
                            "I was tired of fighting my own devices. Phone to laptop. Cable. AirDrop sometimes works. Cloud uploads are slow. I didn’t want another app. I wanted the moment to disappear."
                        </div>
                        <p className="mt-6 text-gray-400 leading-relaxed">
                            That instinct — reduce friction to zero — became the north star. Every architectural decision was in service of that experience.
                        </p>
                    </section>

                    {/* PHILOSOPHY */}
                    <section id="philosophy" className="mb-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono text-gray-400 mb-4">
                            01. PRINCIPLES
                        </div>
                        <h2 className={`${heading.className} text-3xl font-bold text-white mb-6`}>Ephemeral. Fast. Trustworthy.</h2>
                        <p className="text-gray-400 mb-8 leading-relaxed">
                            LazyDrop is intentionally not a “cloud drive.” It is a live transfer channel. Sessions are temporary. Files are short-lived. Connections feel peer-to-peer even though the system is cloud-mediated.
                        </p>
                        <div className="grid sm:grid-cols-3 gap-4">
                            {[
                                { title: "Instant Presence", desc: "Joining feels like walking into a room." },
                                { title: "Zero Trust Client", desc: "UI is optimistic. Server is authoritative." },
                                { title: "Ephemerality", desc: "Everything expires. Nothing lingers." },
                            ].map((card) => (
                                <div key={card.title} className="p-4 rounded-xl bg-[#16181D] border border-white/5">
                                    <h3 className="text-[#DFFF00] font-bold text-sm mb-2">{card.title}</h3>
                                    <p className="text-xs text-gray-500">{card.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* TECHNOLOGIES */}
                    <section id="technologies" className="mb-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono text-gray-400 mb-4">
                            02. THE TOOLS
                        </div>
                        <h2 className={`${heading.className} text-3xl font-bold text-white mb-6`}>Built With Modern Giants</h2>
                        <p className="text-gray-400 leading-relaxed mb-8">
                            A battle-tested, production-style stack designed for velocity and reliability. The client stays fast; the server stays authoritative.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-5 rounded-xl bg-[#16181D] border border-white/5 hover:border-white/10 transition-colors">
                                <h3 className="text-[#DFFF00] font-bold text-sm mb-4 flex items-center gap-2">
                                    <Code2 size={16} /> Frontend
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                        <span className="text-white font-medium">Next.js</span>
                                        <span className="text-xs text-gray-500">App Router</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                        <span className="text-white font-medium">Tailwind CSS</span>
                                        <span className="text-xs text-gray-500">UI System</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-white font-medium">STOMP Client</span>
                                        <span className="text-xs text-gray-500">Realtime</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 rounded-xl bg-[#16181D] border border-white/5 hover:border-white/10 transition-colors">
                                <h3 className="text-[#DFFF00] font-bold text-sm mb-4 flex items-center gap-2">
                                    <Server size={16} /> Backend
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                        <span className="text-white font-medium">Spring Boot</span>
                                        <span className="text-xs text-gray-500">Java 21</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                        <span className="text-white font-medium">WebSocket</span>
                                        <span className="text-xs text-gray-500">STOMP</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-white font-medium">Flyway + JPA</span>
                                        <span className="text-xs text-gray-500">Postgres</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 rounded-xl bg-[#16181D] border border-white/5 hover:border-white/10 transition-colors">
                                <h3 className="text-[#DFFF00] font-bold text-sm mb-4 flex items-center gap-2">
                                    <Box size={16} /> Infrastructure
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                        <span className="text-white font-medium">DigitalOcean</span>
                                        <span className="text-xs text-gray-500">Backend</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                        <span className="text-white font-medium">Vercel</span>
                                        <span className="text-xs text-gray-500">Frontend</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-white font-medium">Docker Compose</span>
                                        <span className="text-xs text-gray-500">Local Dev</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 rounded-xl bg-[#16181D] border border-white/5 hover:border-white/10 transition-colors">
                                <h3 className="text-[#DFFF00] font-bold text-sm mb-4 flex items-center gap-2">
                                    <Shield size={16} /> Services
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                        <span className="text-white font-medium">Supabase</span>
                                        <span className="text-xs text-gray-500">Auth + Storage</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                        <span className="text-white font-medium">Stripe</span>
                                        <span className="text-xs text-gray-500">Billing</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-white font-medium">GitHub Actions</span>
                                        <span className="text-xs text-gray-500">CI/CD</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ARCHITECTURE */}
                    <section id="architecture" className="mb-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono text-gray-400 mb-4">
                            03. SYSTEM OVERVIEW
                        </div>
                        <h2 className={`${heading.className} text-3xl font-bold text-white mb-6`}>The Modular Monolith</h2>
                        <p className="text-gray-400 leading-relaxed mb-6">
                            High level: Next.js frontend, Spring Boot backend, Supabase, and Postgres. The complexity lives in the boundaries.
                            Instead of microservices, we built a <strong>Modular Monolith</strong> organized by capability.
                        </p>

                        <ModularMonolithDiagram />

                        <p className="text-sm text-gray-500 mt-4">
                            Modules (Session, Realtime, Billing) own their invariants. This keeps transactional integrity today and enables extraction later if needed.
                        </p>

                        <Mermaid title="Production vs Local Architecture" chart={PROD_VS_LOCAL} />
                    </section>

                    {/* IDENTITY */}
                    <section id="identity" className="mb-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono text-gray-400 mb-4">
                            04. TRUST MODEL
                        </div>
                        <h2 className={`${heading.className} text-3xl font-bold text-white mb-6`}>Identity Is Not Binary</h2>
                        <p className="text-gray-400 leading-relaxed mb-6">
                            LazyDrop implements a <strong>Dual-Layer Identity System</strong>. Users can start as Guests identified by a secure, HTTP-only cookie.
                            When they sign up via Supabase, the backend upgrades the identity without breaking active sessions.
                        </p>

                        <div className="p-5 rounded-xl border border-dashed border-white/20 bg-black/20">
                            <ul className="space-y-4 text-sm">
                                <li className="flex gap-3">
                                    <div className="w-1 h-full bg-gray-600 rounded-full" />
                                    <div>
                                        <strong className="text-white block">Guests</strong>
                                        <span className="text-gray-500"> Instant usage, cookie identity, sandboxed limits.</span>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <div className="w-1 h-full bg-[#DFFF00] rounded-full" />
                                    <div>
                                        <strong className="text-white block">Users</strong>
                                        <span className="text-gray-500"> Supabase JWT identity, server-side enforcement, upgrade path.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* REALTIME */}
                    <section id="realtime" className="mb-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono text-gray-400 mb-4">
                            05. WEBSOCKETS
                        </div>
                        <h2 className={`${heading.className} text-3xl font-bold text-white mb-6`}>Real-Time is Distributed State</h2>
                        <p className="text-gray-400 leading-relaxed mb-6">
                            Presence isn’t a boolean; it’s distributed state under failure. We use STOMP over WebSockets for synchronization, not just “chat”.
                        </p>

                        <div className="grid gap-4 text-sm text-gray-400">
                            <div className="flex items-start gap-3 p-4 bg-[#16181D] rounded-lg">
                                <Activity size={16} className="text-[#DFFF00] mt-1" />
                                <div>
                                    <strong className="text-white">Race Conditions</strong>
                                    <p>A file can finish uploading while a peer disconnects. Server enforces ordering + idempotency.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-[#16181D] rounded-lg">
                                <Cpu size={16} className="text-[#DFFF00] mt-1" />
                                <div>
                                    <strong className="text-white">After-Commit Publishing</strong>
                                    <p>DB commits should happen before broadcasting events to avoid “phantom” state on clients.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* STORAGE */}
                    <section id="storage" className="mb-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono text-gray-400 mb-4">
                            06. DATA FLOW
                        </div>
                        <h2 className={`${heading.className} text-3xl font-bold text-white mb-6`}>Two-Phase Transfer Protocol</h2>
                        <p className="text-gray-400 leading-relaxed mb-6">
                            Storage is decoupled from access. The DB stores a stable <span className="font-mono text-white">storage_path</span>, never the ephemeral URL.
                            Signed URLs are generated on demand for time-limited access.
                        </p>

                        <UploadFlowDiagram />

                        <p className="text-gray-400 text-sm">
                            Result: zero server bandwidth for file bytes, horizontal scalability, and strict security via time-limited URLs.
                        </p>
                    </section>

                    {/* FAILURE */}
                    <section id="failure" className="mb-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono text-gray-400 mb-4">
                            07. RELIABILITY
                        </div>
                        <h2 className={`${heading.className} text-3xl font-bold text-white mb-6`}>Failure Is The Default</h2>
                        <p className="text-gray-400 leading-relaxed mb-8">
                            Stripe webhooks are an eventually-consistent stream. Duplicate delivery is normal. We treat webhook processing as an idempotent pipeline
                            with persisted event state and retry scheduling.
                        </p>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="text-white font-bold border-b border-white/10 pb-2">Financial Integrity</h3>
                                <p className="text-sm text-gray-400">
                                    Signature verification + idempotency ensures billing events don’t double-apply. Processing state is stored so retries are safe.
                                </p>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-white font-bold border-b border-white/10 pb-2">Latency Engineering</h3>
                                <p className="text-sm text-gray-400">
                                    Real-time is felt. Keeping app + DB co-located reduces WebSocket round-trip time and makes sessions feel instant.
                                </p>
                            </div>
                        </div>

                        <Mermaid title="Stripe Webhook Reliability State Machine" chart={STRIPE_WEBHOOK_STATE} />
                    </section>

                    {/* DATA MODEL */}
                    <section id="data-model" className="mb-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono text-gray-400 mb-4">
                            08. DATA MODEL
                        </div>
                        <h2 className={`${heading.className} text-3xl font-bold text-white mb-6`}>Database Schema (ER)</h2>
                        <p className="text-gray-400 leading-relaxed mb-6">
                            The schema centers on session ownership, participant presence, file orchestration, and webhook reliability.
                        </p>

                        <Mermaid title="ER Diagram" chart={ER_DIAGRAM} />
                    </section>

                    {/* FUTURE */}
                    <section id="future" className="mb-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono text-gray-400 mb-4">
                            09. WHAT'S NEXT
                        </div>
                        <h2 className={`${heading.className} text-3xl font-bold text-white mb-6`}>Known Limitations & Roadmap</h2>
                        <p className="text-gray-400 leading-relaxed mb-6">
                            LazyDrop currently runs as a single-node real-time server. This keeps complexity manageable while still being production-realistic.
                        </p>

                        <ul className="space-y-3 text-gray-400 text-sm">
                            <li className="flex items-center gap-2"><ArrowDown size={14} className="-rotate-90 text-[#DFFF00]" /> Redis Pub/Sub for WebSocket fan-out.</li>
                            <li className="flex items-center gap-2"><ArrowDown size={14} className="-rotate-90 text-[#DFFF00]" /> Dedicated worker service for heavy cleanup tasks.</li>
                            <li className="flex items-center gap-2"><ArrowDown size={14} className="-rotate-90 text-[#DFFF00]" /> Regional sharding for global latency reduction.</li>
                        </ul>
                    </section>

                    {/* CTA */}
                    <div className="pt-20 border-t border-white/10">
                        <p className="text-2xl font-bold text-white mb-4">Why This Matters</p>
                        <p className="text-gray-400 leading-relaxed mb-8">
                            LazyDrop isn’t impressive because it uses WebSockets — it’s impressive because it models distributed state, enforces billing invariants,
                            and treats failure as a first-class scenario.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="https://github.com/10xDeVv"
                                target="_blank"
                                rel="noreferrer"
                                className="px-6 py-3 rounded-lg bg-[#DFFF00] text-black font-bold text-sm hover:opacity-90 transition-opacity"
                            >
                                View GitHub
                            </a>
                            <a
                                href="https://linkedin.com/"
                                target="_blank"
                                rel="noreferrer"
                                className="px-6 py-3 rounded-lg border border-white/20 text-white font-bold text-sm hover:bg-white/5 transition-colors"
                            >
                                Contact Founder
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
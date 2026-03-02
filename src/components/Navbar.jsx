"use client";

import { useState, useEffect, useRef, memo, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Menu, X, ArrowRight, Zap, LayoutDashboard,
    User, LogOut, Link as LinkIcon, LogIn, XCircle, ChevronDown, Settings, LayoutGrid, Download, CreditCard
} from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import { useApp } from "@/context/LazyDropContext";

function NavbarComponent() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [hash, setHash] = useState("");

    const pathname = usePathname();
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);
    const profileRef = useRef(null);

    // --- CONTEXT ---
    const appContext = useApp();
    const leaveRoom = appContext?.leaveRoom;
    const showToast = appContext?.showToast;

    // --- 1. DETERMINE MODE ---
    const isLanding = pathname === "/";
    const isSession = pathname?.startsWith("/session");
    const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/signup");
    const isApp = !isLanding && !isSession && !isAuthPage;

    // --- 2. AUTH & SCROLL LOGIC ---
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
        };
        checkAuth();

        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        if (!isSession) window.addEventListener("scroll", handleScroll);

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            if (!isSession) window.removeEventListener("scroll", handleScroll);
            document.removeEventListener("mousedown", handleClickOutside);
            subscription.unsubscribe();
        };
    }, [isSession, supabase]);

    // HASH LISTENER (For landing page scroll spy)
    useEffect(() => {
        const update = () => setHash(window.location.hash || "");
        update();
        window.addEventListener("hashchange", update);
        return () => window.removeEventListener("hashchange", update);
    }, []);

    const isActive = (href) => {
        if (href.startsWith("/#")) {
            const targetHash = href.replace("/", "");
            return pathname === "/" && hash === targetHash;
        }
        return pathname === href;
    };

    // Close menus on route change
    useEffect(() => {
        setIsMobileOpen(false);
        setIsProfileOpen(false);
    }, [pathname]);

    // --- 3. ACTIONS ---
    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    const handleCopyLink = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href);
            if (showToast) showToast("Invite link copied!");
            else alert("Link copied!");
        }
    };

    const handleLaunchApp = () => {
        router.push("/dashboard");
    };

    const handleExitSession = async () => {
        // if (isSession && leaveRoom) {
        //     await leaveRoom();
        // }
        router.push("/dashboard");
    };


    const landingLinks = [
        { name: "How it works", href: "/#how-it-works" },
        { name: "Features", href: "/#features" },
        { name: "Pricing", href: "/#pricing" },
        { name: "Why LazyDrop", href: "/#use-cases" },
    ];

    const appLinks = [
        { name: "Drop", href: "/drop" },
        { name: "Join", href: "/join" },
        { name: "Pricing", href: "/pricing" },
    ];

    const middleLinks = isSession ? [] : (isLanding ? landingLinks : appLinks);

    const returnTo =
        typeof window !== "undefined"
            ? `${window.location.pathname}${window.location.search}${window.location.hash}`
            : "/dashboard";

    const signupHref = `/signup?redirect=${encodeURIComponent(returnTo)}`;
    const loginHref  = `/login?redirect=${encodeURIComponent(returnTo)}`;

    const currentPathWithQueryAndHash = () => {
        if (typeof window === "undefined") return "/dashboard";
        return window.location.pathname + window.location.search + window.location.hash;
    };



    const renderUnifiedDropdown = () => (
        <div className="relative z-50" ref={profileRef}>
            <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full border transition-colors ${
                    isSession ? "border-white/10 bg-[#16181D] hover:bg-white/5" : "border-white/10 hover:bg-white/5"
                }`}
            >
                {user ? (
                    // User Avatar
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#DFFF00] to-orange-400 flex items-center justify-center text-black font-bold text-xs uppercase">
                        {user.email?.charAt(0) || "U"}
                    </div>
                ) : (
                    // Guest Avatar
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white font-bold text-xs uppercase">
                        G
                    </div>
                )}
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isProfileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className="absolute right-0 top-full mt-2 w-64 bg-[#16181D] border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2 z-[100]"
                    >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-white/5 mb-2">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">
                                {user ? "Signed in as" : "Guest Mode"}
                            </p>
                            <p className={`text-sm truncate font-medium ${user ? "text-white" : "text-gray-400"}`}>
                                {user ? user.email : "Anonymous User"}
                            </p>
                        </div>

                        {/* PRODUCT NAVIGATION (Visible to Everyone) */}
                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                            <LayoutDashboard size={16} /> Dashboard
                        </Link>
                        <Link href="/drop" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                            <Zap size={16} /> Drop File
                        </Link>
                        <Link href="/join" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                            <Download size={16} /> Join Session
                        </Link>
                        <Link href="/pricing" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                            <CreditCard size={16} /> Pricing
                        </Link>

                        <div className="h-px bg-white/5 my-2" />

                        {/* ACCOUNT / AUTH ACTIONS */}
                        {user ? (
                            <>
                                <Link href="/account" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                                    <Settings size={16} /> Account
                                </Link>
                                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left">
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href={`/login?redirect=${encodeURIComponent(currentPathWithQueryAndHash())}`} className="flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-white/5 transition-colors">
                                    <LogIn size={16} /> Log In
                                </Link>
                                <Link href={`/signup?redirect=${encodeURIComponent(currentPathWithQueryAndHash())}`} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#DFFF00] hover:bg-[#DFFF00]/10 transition-colors font-bold">
                                    <ArrowRight size={16} /> Create Account
                                </Link>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    isScrolled || isMobileOpen || isSession
                        ? "bg-[#0E0F12]/90 backdrop-blur-xl border-b border-white/5 py-4"
                        : "bg-transparent py-6"
                }`}
            >
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

                    {/* A. LOGO */}
                    <Link href={"/"} className="flex items-center gap-3 group z-50 relative">
                        {/* Animated Container for Logo */}
                            {/* Insert your actual logo image here */}
                            {/* Ensure you have /public/logo.png or similar */}
                            <Image
                                src="/logo.png"
                                alt="LazyDrop"
                                width={24}
                                height={24}
                                className="w-8 h-8 object-contain"
                            />

                        {/* Wordmark */}
                        <span className="font-bold text-xl tracking-tight text-white group-hover:text-[#DFFF00] transition-colors">
                            LazyDrop
                        </span>
                    </Link>

                    {/* B. MIDDLE LINKS (Desktop only, hidden in Session) */}
                    <div className="hidden md:flex items-center gap-8">
                        {middleLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`text-sm font-medium transition-colors relative group ${isActive(link.href) ? "text-[#DFFF00]" : "text-gray-400 hover:text-white"}`}
                            >
                                {link.name}
                                <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#DFFF00] transition-all ${isActive(link.href) ? "w-full" : "w-0 group-hover:w-full"}`} />
                            </Link>
                        ))}
                    </div>

                    {/* C. RIGHT ACTIONS */}
                    <div className="hidden md:flex items-center gap-4">

                        {/* MODE 1: SESSION */}
                        {isSession ? (
                            <>
                                {/* Show Dropdown for Everyone in Session */}
                                {renderUnifiedDropdown()}

                                <button
                                    onClick={handleExitSession}
                                    className="px-5 py-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl font-bold text-sm hover:bg-red-500/20 transition-all flex items-center gap-2"
                                >
                                    <XCircle size={16} /> Exit
                                </button>
                            </>
                        ) : (
                            /* MODE 2: NON-SESSION */
                            isLanding ? (
                                /* LANDING: Marketing CTA */
                                user ? (
                                    <button
                                        onClick={handleLaunchApp}
                                        className="px-5 py-2.5 bg-[#DFFF00] text-black rounded-full font-bold text-sm hover:bg-[#ccee00] shadow-lg transition-all flex items-center gap-2"
                                    >
                                        Launch App <ArrowRight size={16} />
                                    </button>
                                ) : (
                                    <>
                                        <Link href={`/login?redirect=${encodeURIComponent(currentPathWithQueryAndHash())}`} className="text-sm font-bold text-white hover:text-[#DFFF00] transition-colors">
                                            Log In
                                        </Link>
                                        <Link href={`/signup?redirect=${encodeURIComponent(currentPathWithQueryAndHash())}`} className="px-6 py-2.5 bg-white text-black rounded-full font-bold text-sm hover:bg-gray-200 transition-all flex items-center gap-2">
                                            Get Started
                                        </Link>
                                    </>
                                )
                            ) : (
                                /* APP PAGES (Dashboard, Drop, Pricing, etc.) -> ALWAYS DROPDOWN */
                                renderUnifiedDropdown()
                            )
                        )}
                    </div>

                    {/* D. MOBILE TOGGLE */}
                    <button
                        className="md:hidden text-white z-50 p-2"
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                    >
                        {isMobileOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </motion.nav>

            {/* E. MOBILE MENU */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-[#0E0F12] pt-28 px-6 md:hidden flex flex-col h-screen"
                    >
                        <div className="flex flex-col gap-6">

                            {/* Session Links Mobile */}
                            {isSession ? (
                                <>
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active Session</div>
                                    <Link href="/dashboard" className="text-2xl font-bold text-white" onClick={() => setIsMobileOpen(false)}>
                                        Dashboard
                                    </Link>
                                    <Link href="/account" className="text-2xl font-bold text-white" onClick={() => setIsMobileOpen(false)}>
                                        Account
                                    </Link>

                                    <div className="h-px bg-white/10 my-2" />

                                    <button onClick={handleExitSession} className="py-4 bg-red-500/20 text-red-300 rounded-xl font-bold text-center text-lg flex items-center justify-center gap-2">
                                        <XCircle size={18} /> Exit Session
                                    </button>
                                </>
                            ) : (
                                /* Standard Links Mobile */
                                <>
                                    {/* Show Product Nav First (For Guests too) */}
                                    <Link href="/dashboard" className="text-3xl font-bold text-white" onClick={() => setIsMobileOpen(false)}>
                                        Dashboard
                                    </Link>
                                    <Link href="/drop" className="text-3xl font-bold text-white" onClick={() => setIsMobileOpen(false)}>
                                        Drop
                                    </Link>
                                    <Link href="/join" className="text-3xl font-bold text-white" onClick={() => setIsMobileOpen(false)}>
                                        Join
                                    </Link>
                                    <Link href="/pricing" className="text-3xl font-bold text-white" onClick={() => setIsMobileOpen(false)}>
                                        Pricing
                                    </Link>

                                    <div className="h-px bg-white/10 my-4" />

                                    {/* Auth Actions */}
                                    {user ? (
                                        <>
                                            <Link href="/account" className="text-xl font-medium text-gray-300 flex items-center gap-3" onClick={() => setIsMobileOpen(false)}>
                                                <Settings size={20} /> Account
                                            </Link>
                                            <button onClick={handleLogout} className="text-xl font-medium text-red-400 flex items-center gap-3 mt-4">
                                                <LogOut size={20} /> Sign Out
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link href={`/login?redirect=${encodeURIComponent(currentPathWithQueryAndHash())}`} className="text-xl font-bold text-white flex items-center gap-3"><LogIn size={20}/> Log In</Link>
                                            <Link href={`/signup?redirect=${encodeURIComponent(currentPathWithQueryAndHash())}`} className="py-4 bg-[#DFFF00] text-black rounded-xl font-bold text-center text-lg mt-4">
                                                Create Account
                                            </Link>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// Wrap in memo to prevent re-renders from context updates
export const Navbar = memo(NavbarComponent);
export default Navbar;
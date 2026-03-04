"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({ error, reset }) {
    useEffect(() => {
        console.error("Route error:", error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: "#0E0F12", color: "#F5F5F5" }}>
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 text-center max-w-md">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 mb-8">
                    <AlertTriangle className="w-10 h-10 text-red-400" />
                </div>

                <h1 className="text-4xl font-bold mb-3 tracking-tight">Something went wrong</h1>
                <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                    An unexpected error occurred. You can try again or head back to the homepage.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={reset}
                        className="px-8 py-4 bg-[#DFFF00] text-black rounded-xl font-bold hover:bg-[#ccee00] transition shadow-lg flex items-center gap-2"
                    >
                        <RefreshCw size={18} /> Try Again
                    </button>
                    <Link
                        href="/"
                        className="px-8 py-4 border border-white/10 bg-white/5 text-white rounded-xl font-bold hover:bg-white/10 transition flex items-center gap-2"
                    >
                        <Home size={18} /> Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
}

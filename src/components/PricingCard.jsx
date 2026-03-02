"use client";

import Link from "next/link";
import { Check, Crown, Loader2 } from "lucide-react";
import { Space_Grotesk, Inter } from "next/font/google";

const heading = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });
const body = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });

const TOKENS = {
    bg: "#0B0C0F",
    text: "#F5F5F5",
    muted: "#9CA3AF",
    lime: "#DFFF00",
};

export default function PricingCard({ plan, loading, onCheckout, isCurrent, isPaidMember }) {
    // Logic: Identify Plan Type
    const isPopular = plan.popular; // Plus
    const isPro = plan.name === "Pro"; // Pro

    // Dynamic Styling based on Tier
    let borderColor = "border-white/10";
    let bgColor = "bg-[#16181D]";
    let accentColor = "text-white";
    let checkBg = "bg-white/10 text-white";

    if (isPopular) { // Plus Styling (Lime)
        borderColor = "border-[#DFFF00]/40";
        bgColor = "bg-gradient-to-b from-[#DFFF00]/5 to-[#16181D]";
        accentColor = "text-[#DFFF00]";
        checkBg = "bg-[#DFFF00] text-black";
    } else if (isPro) { // Pro Styling (Purple)
        borderColor = "border-purple-500/40";
        bgColor = "bg-gradient-to-b from-purple-500/10 to-[#16181D]";
        accentColor = "text-purple-400";
        checkBg = "bg-purple-500 text-white";
    }

    return (
        <div
            className={`
                relative rounded-[40px] p-10 sm:p-12 border transition-transform duration-300 flex flex-col h-full
                ${borderColor} ${bgColor} hover:scale-[1.01] hover:shadow-2xl
            `}
        >
            {isPopular && (
                <div className="absolute top-0 right-0 text-xs font-bold px-5 py-3 rounded-bl-2xl tracking-widest text-black uppercase" style={{ background: TOKENS.lime }}>
                    POPULAR
                </div>
            )}

            {/* Header */}
            <div className="mb-8">
                <h3 className={`${heading.className} text-3xl font-bold mb-3`} style={{ color: TOKENS.text }}>{plan.name}</h3>
                <p className={`${body.className} text-lg mb-8 text-gray-400 leading-relaxed`}>{plan.description}</p>

                <div className="flex items-baseline gap-2">
                    <span className={`${heading.className} text-6xl font-bold ${accentColor}`}>${plan.price}</span>
                    {plan.price !== "0" && <span className="text-xl font-normal text-gray-500">/mo</span>}
                </div>
                {plan.price !== "0" && <p className="text-xs text-gray-500 mt-3 font-mono tracking-wide">BILLED MONTHLY</p>}
            </div>

            {/* Features */}
            <div className="flex-1 mb-12">
                <ul className="space-y-5">
                    {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-4">
                            <div className={`p-1 rounded-full shrink-0 ${checkBg}`}>
                                <Check size={14} strokeWidth={3} />
                            </div>
                            <span className={`${body.className} text-base text-gray-300`}>{feat}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Action Area */}
            <div className="mt-auto">
                {isCurrent ? (
                    <button disabled className="w-full py-5 rounded-2xl border border-white/10 bg-white/5 text-gray-400 font-bold text-lg cursor-not-allowed flex items-center justify-center gap-3">
                        <Check size={20} /> Current Plan
                    </button>
                ) : plan.price === "0" ? (
                    <Link href="/drop" className="block w-full py-5 rounded-2xl border border-white/20 text-white hover:bg-white hover:text-black font-bold text-lg text-center transition-all">
                        Start Dropping
                    </Link>
                ) : (
                    <button
                        onClick={onCheckout}
                        disabled={loading}
                        className={`
                            w-full py-5 rounded-2xl font-bold text-lg text-center transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed
                            ${isPopular
                            ? "bg-[#DFFF00] text-black hover:bg-[#ccee00] shadow-[0_0_30px_rgba(223,255,0,0.2)]"
                            : isPro
                                ? "bg-purple-600 text-white hover:bg-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.2)]"
                                : "bg-white text-black hover:bg-gray-200"}
                        `}
                    >
                        {loading ? <Loader2 className="animate-spin" size={24} /> : (isPaidMember ? "Switch Plan" : plan.cta)}
                    </button>
                )}
            </div>
        </div>
    );
}
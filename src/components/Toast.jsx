"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap, AlertCircle, X, Info } from "lucide-react";
import { Inter, Space_Grotesk } from "next/font/google";

const body = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });
const heading = Space_Grotesk({ subsets: ["latin"], weight: ["700"], display: "swap" });

const TOKENS = {
    success: "#DFFF00",
    error: "#FF4D4D",
    info: "#3B82F6",
    bg: "#16181D",
    border: "rgba(255,255,255,0.1)",
};

const ICONS = {
    success: <Zap size={20} className="text-black" fill="black" />,
    error: <AlertCircle size={20} className="text-white" />,
    info: <Info size={20} className="text-white" />,
};

export default function ToastContainer({ toasts, removeToast, onAction }) {
    return (
        <div className={`fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none ${body.className}`}>
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <ToastItem
                        key={toast.id}
                        toast={toast}
                        removeToast={removeToast}
                        onAction={onAction}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}

function ToastItem({ toast, removeToast, onAction }) {
    const { id, message, type = "success", action, duration = 4000 } = toast;
    const color = TOKENS[type] || TOKENS.success;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="pointer-events-auto relative overflow-hidden rounded-2xl bg-[#16181D] border border-white/10 shadow-2xl min-w-[320px] max-w-md backdrop-blur-xl"
        >
            {/* Accent */}
            <div className="absolute top-0 left-0 bottom-0 w-1 z-10" style={{ background: color }} />

            {/* Mesh */}
            <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ background: `radial-gradient(circle at top left, ${color}, transparent 70%)` }}
            />

            <div className="flex items-start gap-4 p-4 pl-5">
                {/* Icon */}
                <div
                    className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                    style={{
                        background:
                            type === "success"
                                ? TOKENS.success
                                : type === "error"
                                    ? "rgba(255, 77, 77, 0.2)"
                                    : "rgba(59, 130, 246, 0.2)",
                    }}
                >
                    {ICONS[type] || ICONS.success}
                </div>

                <div className="flex-1 pt-0.5 min-w-0">
                    <h4 className={`${heading.className} text-sm font-bold text-white mb-0.5 uppercase tracking-wide opacity-90`}>
                        {type === "success" ? "Success" : type === "error" ? "Error" : "Notice"}
                    </h4>

                    <p className="text-sm text-gray-400 leading-relaxed font-medium break-words">
                        {message}
                    </p>

                    {/* ✅ Action */}
                    {action?.label && (
                        <div className="mt-2">
                            <button
                                onClick={() => onAction?.(toast)}
                                className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-bold border transition
                  ${
                                    type === "error"
                                        ? "border-red-500/30 bg-red-500/10 text-red-100 hover:bg-red-500/20"
                                        : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                                }`}
                            >
                                {action.label}
                            </button>
                        </div>
                    )}
                </div>

                <button onClick={() => removeToast(id)} className="text-gray-500 hover:text-white transition-colors p-1">
                    <X size={16} />
                </button>
            </div>

            {/* Progress */}
            <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: Math.max(0.2, duration / 1000), ease: "linear" }}
                className="absolute bottom-0 left-0 h-[2px] opacity-30"
                style={{ background: color }}
            />
        </motion.div>
    );
}

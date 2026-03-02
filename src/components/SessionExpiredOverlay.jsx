"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/LazyDropContext";
import { ShieldAlert, Home, Zap } from "lucide-react";
import { Space_Grotesk, Inter } from "next/font/google";

const heading = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });
const body = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap" });

export default function SessionExpiredOverlay({ children }) {
  const router = useRouter();
  const { timeLeft, currentSession, bus, resetSession } = useApp();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (currentSession && timeLeft === 0) {
      setIsVisible(true);
    }

    // Trigger on websocket events
    const offExpire = bus?.on("sessionExpired", () => setIsVisible(true));
    const offClosed = bus?.on("sessionClosed", () => setIsVisible(true));

    return () => {
      offExpire?.();
      offClosed?.();
    };
  }, [timeLeft, currentSession, bus]);

  const handleHome = async () => {
    await resetSession();
    setIsVisible(false);
    router.push("/dashboard");
  };

  return (
      <>
        {children}
        <AnimatePresence>
          {isVisible && (
              <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`${body.className} fixed inset-0 z-[9999] flex items-center justify-center bg-[#0B0C0F]/95 backdrop-blur-xl p-6`}
              >
                {/* Background Ambient Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />

                <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="max-w-md w-full bg-[#16181D] border border-white/10 rounded-[32px] p-8 sm:p-10 text-center shadow-2xl relative overflow-hidden"
                >
                  {/* Icon */}
                  <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
                    <ShieldAlert size={40} className="text-[#FF4D4D]" />
                  </div>

                  {/* Text */}
                  <h2 className={`${heading.className} text-3xl sm:text-4xl font-bold text-white mb-4`}>
                    Session Terminated
                  </h2>
                  <p className="text-gray-400 text-base leading-relaxed mb-10">
                    This secure channel has self-destructed. All files and logs have been permanently wiped from the servers.
                  </p>

                  {/* Action */}
                  <button
                      onClick={handleHome}
                      className="group w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-[#DFFF00] transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95"
                  >
                    <Home size={20} className="group-hover:hidden" />
                    <Zap size={20} className="hidden group-hover:block" />
                    Start Fresh
                  </button>
                </motion.div>
              </motion.div>
          )}
        </AnimatePresence>
      </>
  );
}
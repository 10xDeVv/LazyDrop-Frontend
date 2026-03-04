import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "#0E0F12" }}>
            <div className="relative">
                <div className="absolute -inset-8 bg-[#DFFF00]/10 rounded-full blur-[60px] animate-pulse" />
                <Loader2 className="w-12 h-12 text-[#DFFF00] animate-spin relative z-10" />
            </div>
            <p className="mt-8 text-gray-500 text-sm font-medium tracking-widest uppercase">Loading</p>
        </div>
    );
}

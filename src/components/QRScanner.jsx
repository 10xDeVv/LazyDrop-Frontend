"use client";
import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { X, Camera, AlertCircle } from "lucide-react";

export default function QRScanner({ onResult, onClose }) {
    const videoRef = useRef(null);
    const readerRef = useRef(null);
    const [err, setErr] = useState(null);
    const [scanning, setScanning] = useState(false);

    useEffect(() => {
        let mounted = true;
        let controls = null;

        const startScanning = async () => {
            try {
                setScanning(true);
                setErr(null);

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" }
                });

                // Stop tracks immediately after getting permission/stream info
                // The library handles the actual stream
                stream.getTracks().forEach(track => track.stop());

                if (!mounted) return;

                const devices = await BrowserMultiFormatReader.listVideoInputDevices();

                if (devices.length === 0) {
                    setErr("No cameras found on this device");
                    return;
                }

                const backCamera = devices.find((d) =>
                    /back|rear|environment/i.test(d.label)
                );
                const deviceId = backCamera?.deviceId ?? devices[0]?.deviceId;

                if (!videoRef.current || !deviceId) {
                    setErr("Could not initialize camera");
                    return;
                }

                const reader = new BrowserMultiFormatReader();
                readerRef.current = reader;

                controls = await reader.decodeFromVideoDevice(
                    deviceId,
                    videoRef.current,
                    (result) => {
                        if (result) {
                            onResult(result.getText());
                            if (controls) controls.stop();
                        }
                    }
                );

            } catch (error) {
                console.error("Scanner error:", error);
                if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
                    setErr("Camera access denied.");
                } else if (error.name === "NotFoundError") {
                    setErr("No camera found.");
                } else {
                    setErr("Failed to start camera.");
                }
            } finally {
                setScanning(false);
            }
        };

        startScanning();

        return () => {
            mounted = false;
            if (controls) {
                try { controls.stop(); } catch (e) { console.error(e); }
            }
            if (readerRef.current) {
                try { readerRef.current.reset(); } catch (e) { console.error(e); }
            }
        };
    }, [onResult]);

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
            <div className="bg-[#16181D] border border-white/10 rounded-3xl overflow-hidden w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="p-5 flex justify-between items-center border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#DFFF00]/10 flex items-center justify-center text-[#DFFF00]">
                            <Camera size={18} />
                        </div>
                        <h3 className="font-bold text-white text-lg">Scan Code</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Video Area */}
                <div className="relative aspect-square bg-black overflow-hidden group">
                    <video
                        ref={videoRef}
                        className="w-full h-full object-cover opacity-80"
                        playsInline
                        muted
                        autoPlay
                    />

                    {/* Acid Scan Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-[70%] h-[70%] relative">
                            {/* Glowing Corners */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#DFFF00] rounded-tl-lg shadow-[0_0_15px_#DFFF00]"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#DFFF00] rounded-tr-lg shadow-[0_0_15px_#DFFF00]"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#DFFF00] rounded-bl-lg shadow-[0_0_15px_#DFFF00]"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#DFFF00] rounded-br-lg shadow-[0_0_15px_#DFFF00]"></div>

                            {/* Scanning Line Animation */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-[#DFFF00]/50 shadow-[0_0_20px_#DFFF00] animate-[scan_2s_ease-in-out_infinite]" />
                        </div>
                    </div>

                    {scanning && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-8 h-8 border-4 border-[#DFFF00] border-t-transparent rounded-full animate-spin" />
                                <span className="text-[#DFFF00] text-sm font-mono tracking-widest uppercase">Initializing...</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer / Error State */}
                <div className="p-6 bg-[#16181D]">
                    {err ? (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400">
                            <AlertCircle size={20} className="shrink-0 mt-0.5" />
                            <p className="text-sm">{err}</p>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 text-sm">
                            Point your camera at a Lazydrop QR code
                        </p>
                    )}
                </div>
            </div>

            {/* Scan Animation Keyframes */}
            <style jsx>{`
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
            `}</style>
        </div>
    );
}
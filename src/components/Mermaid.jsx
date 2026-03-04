"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

export default function Mermaid({ chart, title, className = "" }) {
    const reactId = useId().replace(/:/g, "");
    const containerRef = useRef(null);
    const [error, setError] = useState(null);

    const code = useMemo(() => (chart || "").trim(), [chart]);

    useEffect(() => {
        let cancelled = false;

        async function render() {
            setError(null);
            if (!containerRef.current) return;

            const mermaid = (await import("mermaid")).default;

            mermaid.initialize({
                startOnLoad: false,
                securityLevel: "strict",
                theme: "base",
                themeVariables: {
                    background: "#0E0F12",
                    primaryColor: "#16181D",
                    primaryBorderColor: "rgba(255,255,255,0.12)",
                    primaryTextColor: "#F5F5F5",
                    secondaryColor: "#0B0C10",
                    secondaryBorderColor: "rgba(255,255,255,0.12)",
                    secondaryTextColor: "#F5F5F5",
                    lineColor: "rgba(255,255,255,0.28)",
                    textColor: "#F5F5F5",
                    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Inter",
                    tertiaryColor: "#DFFF00",
                    accent1: "#DFFF00",
                    accent2: "#9CA3AF",
                    nodeBorder: "rgba(255,255,255,0.16)",
                    mainBkg: "#0E0F12",
                },
                flowchart: { curve: "basis", padding: 10 },
            });

            try {
                containerRef.current.innerHTML = "";

                const { svg } = await mermaid.render(`mmd-${reactId}`, code);
                if (cancelled) return;

                containerRef.current.innerHTML = svg;

                const svgEl = containerRef.current.querySelector("svg");
                if (svgEl) {
                    svgEl.style.width = "100%";
                    svgEl.style.height = "auto";
                }
            } catch (e) {
                if (!cancelled) setError(e?.message || "Mermaid render failed");
            }
        }

        render();
        return () => {
            cancelled = true;
        };
    }, [code, reactId]);

    return (
        <div className={`w-full my-8 rounded-2xl border border-white/10 bg-black/20 overflow-hidden ${className}`}>
            {title ? (
                <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
                    <div className="text-xs uppercase tracking-widest text-gray-500 font-bold">{title}</div>
                </div>
            ) : null}

            <div className="p-5">
                {error ? (
                    <div className="text-sm text-red-300">
                        Mermaid error: {error}
                        <pre className="mt-3 text-xs text-gray-400 whitespace-pre-wrap">{code}</pre>
                    </div>
                ) : (
                    <div ref={containerRef} />
                )}
            </div>
        </div>
    );
}
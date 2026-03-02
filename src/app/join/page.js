// app/join/page.jsx
import { Suspense } from "react";
import JoinClient from "./JoinClient";

export default function JoinPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0E0F12] text-white flex items-center justify-center">Loading…</div>}>
            <JoinClient />
        </Suspense>
    );
}

import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#0E0F12] text-white flex items-center justify-center">
                    Loading…
                </div>
            }
        >
            <LoginClient />
        </Suspense>
    );
}

// app/signup/page.jsx
import { Suspense } from "react";
import SignupClient from "./SignUpClient";

export default function SignUpPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#0E0F12] text-white flex items-center justify-center">
                    Loading…
                </div>
            }
        >
            <SignupClient />
        </Suspense>
    );
}

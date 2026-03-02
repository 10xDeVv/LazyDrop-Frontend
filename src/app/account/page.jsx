// app/account/page.jsx
import { Suspense } from "react";
import AccountClient from "./AccountClient";

export default function AccountPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#0B0C0F] text-white flex items-center justify-center">
                    Loading…
                </div>
            }
        >
            <AccountClient />
        </Suspense>
    );
}

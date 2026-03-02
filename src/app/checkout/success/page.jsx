// app/checkout/success/page.jsx
import { Suspense } from "react";
import CheckoutSuccessClient from "./CheckoutSuccessClient";

export default function CheckoutSuccessPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#0B0C0F] text-white flex items-center justify-center">
                    Loading…
                </div>
            }
        >
            <CheckoutSuccessClient />
        </Suspense>
    );
}

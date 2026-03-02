// app/auth/callback/CallbackClient.jsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function CallbackClient() {
    const supabase = createClient();
    const router = useRouter();
    const params = useSearchParams();

    useEffect(() => {
        const run = async () => {
            const redirectParam = params.get("redirect");
            const redirect =
                redirectParam && redirectParam.startsWith("/") ? redirectParam : "/dashboard";

            await supabase.auth.getSession();

            router.replace(redirect);
            router.refresh();
        };

        run();
    }, [router, params, supabase]);

    return null;
}

"use client";

import Link from "next/link";
import { useCurrentUrlPath } from "@/lib/redirect";

export function LoginLink({ children, href = "/login", ...props }) {
    const current = useCurrentUrlPath();
    const link = `${href}?redirect=${encodeURIComponent(current)}`;
    return (
        <Link href={link} {...props}>
            {children}
        </Link>
    );
}

export function SignupLink({ children, href = "/signup", ...props }) {
    const current = useCurrentUrlPath();
    const link = `${href}?redirect=${encodeURIComponent(current)}`;
    return (
        <Link href={link} {...props}>
            {children}
        </Link>
    );
}
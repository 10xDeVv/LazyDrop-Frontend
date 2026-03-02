// app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import InstantShareProvider from "../context/LazyDropContext";
import SessionExpiredOverlay from "../components/SessionExpiredOverlay";
import { UserProvider } from "@/context/UserContext";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "LazyDrop — The fastest way to move files between devices",
    description: "Instant, session-based file transfer. Scan a QR, drop files, download anywhere. No drives. No clutter. Just fast, temporary sharing.",
};


export default function RootLayout({ children }) {
    return (
        <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
        <body className="antialiased">
        <UserProvider>
            <InstantShareProvider>
                <SessionExpiredOverlay>
                    {children}
                </SessionExpiredOverlay>
            </InstantShareProvider>
        </UserProvider>
        </body>
        </html>
    );
}
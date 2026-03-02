// context/UserContext.js
"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const UserContext = createContext({
    user: null,
    loading: true,
    signIn: async () => {},
    signOut: async () => {},
});

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    email: session.user.email,
                    isPlus: session.user.user_metadata?.plan === "plus",
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => listener.subscription.unsubscribe();
    }, []);

    const signIn = async (email) => {
        await supabase.auth.signInWithOtp({ email });
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <UserContext.Provider value={{ user, loading, signIn, signOut }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => useContext(UserContext);
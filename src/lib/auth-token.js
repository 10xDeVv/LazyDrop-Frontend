import { createClient } from "@/lib/supabase";

export async function getSupabaseAccessToken() {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || null;
}

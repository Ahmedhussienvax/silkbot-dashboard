import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * 🔒 SilkBot Enterprise Auth Context (S-01)
 * This function creates a server-side Supabase client with prioritized 
 * Service-Discovery networking. It attempts to use the internal Docker 
 * bridge before falling back to public endpoints.
 */
export async function createClient() {
    const cookieStore = await cookies();

    // Prioritized Discovery Logic: 
    // 1. Internal Docker FQDN (Fastest, Secure)
    // 2. Public SSL Endpoint (Fallback)
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Fail-Fast: Prevent fragmented environment from causing silent failures or "Verify loops"
    if (!supabaseUrl || !supabaseKey) {
        throw new Error(
            "❌ [Critical Failure] Supabase environment fragmented. " +
            "Ensure SUPABASE_URL/SUPABASE_ANON_KEY are injected. " +
            "Reference Directive: ENTERPRISE_AUTH_SERVICEDISCOVERY_V1"
        );
    }

    return createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );
}

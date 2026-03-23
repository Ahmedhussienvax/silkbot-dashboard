import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | undefined;

/**
 * [UI-04] Singleton Browser Client Initialization
 * Prevents multiple GoTrue instances and race conditions.
 */
export function createClient() {
    if (client) return client;

    client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    return client;
}

// Export a singleton for convenience in non-hook contexts
export const supabase = createClient();

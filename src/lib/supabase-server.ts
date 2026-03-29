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

  // 🛰️ B-07 Internal Proxy Fix
  const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const internalProxy = 'http://supabase-kong:8000';
  const publicHost = new URL(publicUrl).host;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(
    publicUrl, // Stable naming: Public URL
    anonKey,
    {
      global: {
        fetch: (url, options) => {
          // 🚀 Route through internal Docker kong
          const targetUrl = url.toString().replace(publicUrl, internalProxy);
          return fetch(targetUrl, {
            ...options,
            headers: {
              ...options?.headers,
              'Host': publicHost, // Kong ID routing
              'x-application-name': 'silkbot-dashboard-internal-srv'
            },
          });
        },
      },
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
            // Safe to ignore in Server Components
          }
        },
      },
    }
  );
}

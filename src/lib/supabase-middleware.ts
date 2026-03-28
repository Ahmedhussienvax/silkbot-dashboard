import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/**
 * 🛰️ SilkBot Middleware Engine (M-01)
 * This middleware manages session refreshes and RBAC-based redirects.
 * It is optimized for high-performance internal network discovery.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

// 1. URL Discovery: Use public URL as primary if internal networking is unstable in middleware context
  const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const internalUrl = process.env.SUPABASE_URL;
  const supabaseUrl = internalUrl || publicUrl; 
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Use a try-catch to prevent network transients from triggering hard logout loops
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user;
  } catch (err) {
    console.error("⚠️ [Middleware] Auth verification failing. Session might be stale or unreachable.");
  }

  const pathname = request.nextUrl.pathname;
  const cleanPath = pathname.replace(/^\/(en|ar)/, '');
  const locale = pathname.split('/')[1] === 'ar' ? 'ar' : 'en';

  // 1. PUBLIC ROUTES ALLOWLIST (Prevents Issue 1: Intro Redirect)
  const isPublicRoute = cleanPath === '' || cleanPath === '/' || cleanPath === '/login' || cleanPath === '/register';

  if (user) {
    const globalRole = user.app_metadata?.global_role;
    const tenantRole = user.app_metadata?.tenant_role;

    // 1. RBAC Modules: Audiences/Super-broadcasts restricted to Superadmins
    const isGlobalModule = cleanPath.startsWith('/dashboard/audiences') || cleanPath.startsWith('/dashboard/super-broadcasts');
    if (isGlobalModule && globalRole !== 'superadmin') {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }

    // 2. Tenancy Guard: Agents locked out of Billing/Team
    const isSensitiveModule = cleanPath.startsWith('/dashboard/billing') || cleanPath.startsWith('/dashboard/team');
    if (isSensitiveModule && tenantRole === 'agent') {
        return NextResponse.redirect(new URL(`/${locale}/dashboard/messages`, request.url));
    }

    // 3. Prevent logged-in users from hitting login page (optional but good for loops)
    if (cleanPath === '/login' || cleanPath === '/register') {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }
  } else if (cleanPath.startsWith('/dashboard') && !isPublicRoute) {
      // 2. Auth Guard: Strictly for dashboard protected routes
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  return response;
}

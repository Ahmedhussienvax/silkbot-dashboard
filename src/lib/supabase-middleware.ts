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

  // 1. URL Discovery: Use public URL as primary in middleware context for cookie domain consistency
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL; 
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

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
    console.error("⚠️ [Middleware] Auth verification failing. Proceeding as guest.");
  }

  const pathname = request.nextUrl.pathname;
  const locale = pathname.split('/')[1] === 'ar' ? 'ar' : 'en';
  const cleanPath = pathname.replace(/^\/(en|ar)/, '') || '/';

  // Helper to create redirects that PRESERVE cookies (Fix for S-03 Loop)
  const createRedirect = (url: string) => {
    const redirectResponse = NextResponse.redirect(new URL(url, request.url));
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  };

  // 1. PUBLIC ROUTES ALLOWLIST (Skill 14 Resilience)
  const isPublicRoute = cleanPath === '/' || cleanPath === '/login' || cleanPath === '/register' || cleanPath === '/dashboard/intro';

  if (user) {
    const globalRole = user.app_metadata?.global_role;
    const tenantRole = user.app_metadata?.tenant_role;

    // RBAC: Restricted modules for Superadmins only
    const isGlobalModule = cleanPath.startsWith('/dashboard/audiences') || cleanPath.startsWith('/dashboard/super-broadcasts');
    if (isGlobalModule && globalRole !== 'superadmin') {
      return createRedirect(`/${locale}/dashboard`);
    }

    // RBAC: Agents restricted from billing/team
    const isSensitiveModule = cleanPath.startsWith('/dashboard/billing') || cleanPath.startsWith('/dashboard/team');
    if (isSensitiveModule && tenantRole === 'agent') {
        return createRedirect(`/${locale}/dashboard/messages`);
    }

    // Safety: Prevent logged-in users from hitting login page
    if (cleanPath === '/login' || cleanPath === '/register') {
      return createRedirect(`/${locale}/dashboard`);
    }
  } else if (cleanPath.startsWith('/dashboard') && !isPublicRoute) {
      // Auth Guard: Force login for protected routes
      return createRedirect(`/${locale}/login`);
  }

  return response;
}

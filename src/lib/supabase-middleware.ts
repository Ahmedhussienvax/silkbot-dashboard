import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/**
 * 🛰️ SilkBot Middleware Engine (M-05 Resilience Version)
 * Optimized for high-performance internal network discovery & RBAC guarding.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 1. Dual-Network Resilience: Prioritize internal networking for Docker speed
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL; 
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const publicFQDN = "supabase.150.136.71.17.sslip.io"; // المنتظر من الـ Gateway

  if (!supabaseUrl || !supabaseKey) {
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      global: {
        headers: {
          'Host': publicFQDN, // أهم سطر لإصلاح مشكلة الـ Gateway
        },
      },
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
      auth: {
        persistSession: false,
        detectSessionInUrl: false,
      }
    }
  );

  // 2. Diagnostics: Handling the "fetch failed" loop gracefully
  let user = null;
  let hasNetworkIssue = false;

  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
       if (error.message.toLowerCase().includes('fetch')) {
          console.error(`🚨 [Middleware Networking] Fetch failed to reach Supabase at: ${supabaseUrl}`);
          hasNetworkIssue = true;
       }
    } else {
       user = data?.user;
    }
  } catch (err: any) {
    console.error(`💥 [Critical Connectivity Failure] Middleware unable to authenticate: ${err.message}`);
    hasNetworkIssue = true;
  }

  const pathname = request.nextUrl.pathname;
  const locale = pathname.split('/')[1] === 'ar' ? 'ar' : 'en';
  
  // Robust Path Cleaning: Ensure we don't end up with /login/dashboard
  let cleanPath = pathname.replace(/^\/(en|ar)/, '');
  if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
  if (cleanPath === '') cleanPath = '/';

  // Absolute Redirect Helper to kill the hybrid /login/dashboard path
  const createRedirect = (target: string) => {
    // target is expected to be like '/en/dashboard' or '/en/login'
    const url = new URL(target, request.url);
    const redirectResponse = NextResponse.redirect(url);
    
    // Preserve cookies accurately across redirects
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  };

  // 3. Loop Breaker (S-03 & M-05): If networking fails, allow access to prevent redirect logs
  if (hasNetworkIssue) {
    console.warn("⚠️ [Auth Guard] Proceeding as guest due to server-side connectivity issues.");
    return response;
  }

  // 4. Public Routes Allowlist
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

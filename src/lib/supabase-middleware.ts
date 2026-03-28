import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  const { data: { user } } = await supabase.auth.getUser();

  // RBAC Routing Control (Skill 17: Enterprise Security)
  const pathname = request.nextUrl.pathname;
  // Localized path cleaning for checks
  const cleanPath = pathname.replace(/^\/(en|ar)/, '');

  if (user) {
    const globalRole = user.app_metadata?.global_role;
    const tenantRole = user.app_metadata?.tenant_role;

    // 1. DaaS Hardening: Only Superadmins can access audiences and super-broadcasts
    const isGlobalModule = cleanPath.startsWith('/dashboard/audiences') || cleanPath.startsWith('/dashboard/super-broadcasts');
    if (isGlobalModule && globalRole !== 'superadmin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // 2. Billing & Team Protection: Agents are locked out of sensitive operations
    const isSensitiveModule = cleanPath.startsWith('/dashboard/billing') || cleanPath.startsWith('/dashboard/team');
    if (isSensitiveModule && tenantRole === 'agent') {
        // Redirect Agents to messages (chats) if they try to access billing/team
        return NextResponse.redirect(new URL('/dashboard/messages', request.url));
    }
  } else if (cleanPath.startsWith('/dashboard')) {
      // Unauthenticated user trying to access dashboard -> redirect to login
      // Force absolute path to prevent '/login/dashboard' hybrid concatenation
      const locale = pathname.split('/')[1] || 'en';
      const isCorrectLocale = ['en', 'ar'].includes(locale);
      const targetLocale = isCorrectLocale ? locale : 'en';
      
      return NextResponse.redirect(new URL(`/${targetLocale}/login`, request.url));
  }

  return response;
}

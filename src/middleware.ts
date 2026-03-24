import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Upstash Redis for Rate Limiting (Skill 10)
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// Defensive validation to prevent crash if variables are missing
const redis = UPSTASH_URL && UPSTASH_TOKEN 
  ? new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN }) 
  : null;

const ratelimit = redis 
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(20, "10 s"), // 20 requests per 10 seconds
    }) 
  : null;


import { updateSession } from './lib/supabase-middleware';


const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Apply Supabase Session & RBAC (Skill 14 & 17)
  // This handles the user.global_role and user.tenant_role route-guarding
  const response = await updateSession(request);
  
  // If the Supabase middleware decided to redirect (e.g. unauthorized agent),
  // we must return that redirect response immediately.
  if (response.status === 307 || response.status === 308) {
      return response;
  }

  // 2. Apply Rate Limiting to API routes
  if (pathname.startsWith('/api') && ratelimit) {
    const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "127.0.0.1";
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);

    if (!success) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      });
    }
  }

  // 3. Final: Apply Internationalization
  // Ensure we wrap the Supabase response if possible, or carry over its cookies.
  const intlResponse = intlMiddleware(request);
  
  // Move Supabase response cookies (if any, like from refresh) to the intl response
  response.cookies.getAll().forEach((cookie) => {
    const { name, value, ...options } = cookie;
    intlResponse.cookies.set(name, value, options);
  });

  return intlResponse;
}

export const config = {
  // Match both internationalized pathnames and API routes
  matcher: ['/', '/(ar|en)/:path*', '/api/:path*']
};

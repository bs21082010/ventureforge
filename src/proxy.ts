import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { RateLimiterMemory } from "rate-limiter-flexible";

const generalLimiter = new RateLimiterMemory({
  points: 100,
  duration: 60,
});

const authLimiter = new RateLimiterMemory({
  points: 20,
  duration: 60,
});

const aiLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60,
});

function getRateLimitKey(request: NextRequest): string {
  return request.headers.get("x-forwarded-for") || "anonymous";
}

function getLimiter(pathname: string) {
  if (pathname.startsWith("/api/ai")) return aiLimiter;
  if (pathname.startsWith("/api/auth")) return authLimiter;
  return generalLimiter;
}

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const key = getRateLimitKey(request);
  const limiter = getLimiter(pathname);

  try {
    await limiter.consume(key);
  } catch {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  if (pathname.startsWith("/api/")) {
    const origin = request.headers.get("origin") || "";
    const isPreflight = request.method === "OPTIONS";

    if (isPreflight) {
      const preflightHeaders: Record<string, string> = {
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
        ...SECURITY_HEADERS,
      };
      if (origin) {
        preflightHeaders["Access-Control-Allow-Origin"] = origin;
        preflightHeaders["Vary"] = "Origin";
      }
      return NextResponse.json({}, { headers: preflightHeaders });
    }

    const response = NextResponse.next();

    if (origin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Vary", "Origin");
    }
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      response.headers.set(key, value);
    }

    return response;
  }

  const response = NextResponse.next();
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};

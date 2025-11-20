import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for setting security headers on all responses
 * Implements Content Security Policy (CSP) and other security headers
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Content Security Policy
  // Prevents inline scripts and restricts script sources
  // Note: In development mode, we allow unsafe-eval for Next.js hot reload
  const isDevelopment = process.env.NODE_ENV === 'development';

  const cspHeader = [
    // Default policy
    "default-src 'self'",
    // Scripts - allow same origin, unsafe-inline for dev, and trusted CDNs
    isDevelopment
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com https://r2cdn.perplexity.ai https://va.vercel-scripts.com"
      : "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com",
    // Styles - allow same origin and unsafe-inline (for Tailwind CSS and styled-components)
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    // Fonts - allow from multiple sources
    "font-src 'self' https://fonts.gstatic.com https://r2cdn.perplexity.ai data:",
    // Images - allow http/https and data URIs
    "img-src 'self' data: https: http:",
    // Connect - allow API calls to backend and Vercel analytics
    isDevelopment
      ? "connect-src 'self' http://localhost:3001 https://va.vercel-scripts.com"
      : "connect-src 'self' https://va.vercel-scripts.com",
    // Form submissions
    "form-action 'self'",
    // Framing
    "frame-ancestors 'none'",
    // Upgrade insecure requests
    "upgrade-insecure-requests",
  ].join('; ');

  // Set CSP header
  response.headers.set('Content-Security-Policy', cspHeader);

  // Additional security headers
  // X-Content-Type-Options prevents MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // X-Frame-Options prevents clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // X-XSS-Protection enables XSS protection in older browsers
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer-Policy controls how much referrer information is shared
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy restricts browser features
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  );

  // Strict-Transport-Security enforces HTTPS
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  return response;
}

// Configure which routes the middleware applies to
export const config = {
  matcher: [
    // Apply to all routes except static files and API routes
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};

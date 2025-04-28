import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that require authentication
const protectedPaths = ['/dashboard'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some((prefix) =>
    path.startsWith(prefix)
  );

  if (isProtectedPath) {
    const token = request.cookies.get('session_token')?.value;

    if (!token) {
      // Redirect to login if no token is present
      return NextResponse.redirect(new URL('/auth/sign-in', request.url));
    }

    // Since we're using a simple token, just check if it exists
    // In a real app, you would verify the token here
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/auth/* (authentication routes)
     * 2. /_next/* (Next.js internals)
     * 3. /fonts/* (inside public directory)
     * 4. /favicon.ico, /sitemap.xml (public files)
     */
    '/((?!api/auth|_next|fonts|favicon.ico|sitemap.xml).*)'
  ]
};

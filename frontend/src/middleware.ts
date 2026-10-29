import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user, role } = await updateSession(request);
  const path = request.nextUrl.pathname;

  // If Supabase is configured, enforce production authentication & RBAC
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // 1. If user is signed in and visits login or signup, redirect to their role portal
    if (user && (path === '/login' || path === '/signup')) {
      if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin', request.url));
      if (role === 'DOCTOR') return NextResponse.redirect(new URL('/doctor', request.url));
      return NextResponse.redirect(new URL('/patient', request.url));
    }

    // 2. Protected Routes
    const isProtected = path.startsWith('/admin') || path.startsWith('/doctor') || path.startsWith('/patient');

    if (isProtected && !user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl);
    }

    // 3. Role-Based Access Control (RBAC)
    if (path.startsWith('/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/?unauthorized=admin', request.url));
    }

    if (path.startsWith('/doctor') && role !== 'DOCTOR' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/?unauthorized=doctor', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/doctor/:path*',
    '/patient/:path*',
    '/login',
    '/signup',
  ],
};

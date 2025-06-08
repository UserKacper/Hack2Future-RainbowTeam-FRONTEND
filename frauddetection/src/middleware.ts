import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  // Define protected routes that require authentication
  const protectedPaths = ['/dashboard', '/dashboard/claims', '/dashboard/users', '/dashboard/settings']
  const isProtectedRoute = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))

  // If trying to access protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If trying to access login/signup with token, redirect to dashboard
  if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/signup'
  ]
}

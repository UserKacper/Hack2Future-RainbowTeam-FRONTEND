import { NextRequest, NextResponse } from "next/server"
import { jwtDecode } from "jwt-decode"

interface TokenClaims {
  Role?: string;
  role?: string;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string;
}

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  // Define protected routes that require authentication
  const protectedPaths = ['/dashboard', '/dashboard/claims', '/dashboard/users', '/dashboard/settings']
  const adminOnlyPaths = ['/dashboard/users', '/dashboard/settings']
  
  const isProtectedRoute = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))
  const isAdminRoute = adminOnlyPaths.some(path => request.nextUrl.pathname.startsWith(path))

  // If trying to access protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url)) 
  }

  // If trying to access login/signup with token, redirect to dashboard
  if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Check admin access for admin-only routes
  if (isAdminRoute && token) {
    try {
      const decodedToken = jwtDecode(token) as TokenClaims
      const userRole = (
        decodedToken.Role || 
        decodedToken.role || 
        decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 
        ''
      ).toLowerCase()

      if (userRole !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch (error) {
      console.error('Error processing token in middleware:', error)
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/login',
    '/signup'
  ]
}

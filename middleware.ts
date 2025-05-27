import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyJWT } from "./src/lib/jwt"

export function middleware(request: NextRequest) {
  // Paths that require authentication
  const protectedPaths = ["/user/", "/driver/", "/admin/"]

  // Check if the current path is protected
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (isProtectedPath) {
    const token = request.cookies.get("auth-token")

    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    const verified = verifyJWT(token.value)
    if (!verified) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    // Check role-based access
    if (request.nextUrl.pathname.startsWith("/admin/") ) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
    if (request.nextUrl.pathname.startsWith("/user/") ) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/user/:path*", "/driver/:path*", "/admin/:path*"],
}

  
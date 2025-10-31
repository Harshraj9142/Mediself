import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token as any
    const { pathname } = req.nextUrl

    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", req.url))
    }

    if (pathname.startsWith("/dashboard") && token.role !== "patient") {
      return NextResponse.redirect(new URL("/doctor-portal", req.url))
    }
    if (pathname.startsWith("/doctor-portal") && token.role !== "doctor") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/login",
    },
  }
)

export const config = {
  matcher: ["/dashboard/:path*", "/doctor-portal/:path*"],
}

import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/login" ||
    pathname === "/onboarding" ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next()
  }

  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (pathname === "/login") {
    return NextResponse.redirect(
      new URL("/dashboard", request.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}

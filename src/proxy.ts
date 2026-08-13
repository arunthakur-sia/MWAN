import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_COOKIE_NAME, hasValidAccessCookie } from "@/lib/auth/access";

// Optimistic check only (reads the cookie, no DB) — per Next's auth guide,
// that's exactly what Proxy is for. Real routes/actions don't do anything
// sensitive enough to need a second, closer-to-the-data check on top.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthed = hasValidAccessCookie(request.cookies.get(ACCESS_COOKIE_NAME)?.value);

  if (pathname === "/login") {
    return isAuthed ? NextResponse.redirect(new URL("/", request.url)) : NextResponse.next();
  }

  if (!isAuthed) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Static files (logo, favicon, intro videos) bypass the gate entirely —
  // they're not sensitive, and the login page needs its logo to render
  // before a code is ever entered.
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|svg|ico|mp4|webp)$).*)"],
};

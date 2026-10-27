import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

interface AccessPayload {
  role?: string;
}

async function verifyAccessToken(token: string): Promise<AccessPayload | null> {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return payload as AccessPayload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const accessToken = request.cookies.get("accessToken")?.value;

  const isProtectedRoute =
    path.startsWith("/seller") ||
    path.startsWith("/admin") ||
    path.startsWith("/profile") ||
    path.startsWith("/garage");

  const payload = accessToken ? await verifyAccessToken(accessToken) : null;

  if (isProtectedRoute) {
    if (!payload) {
      const url = request.nextUrl.clone();
      url.pathname = "/sign-in";
      url.searchParams.set("redirect", path);
      return NextResponse.redirect(url);
    }

    if (path.startsWith("/admin") && payload.role !== "ADMIN") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    if (
      path.startsWith("/seller") &&
      payload.role !== "SELLER" &&
      payload.role !== "ADMIN"
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  if ((path === "/sign-in" || path === "/sign-up") && payload) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

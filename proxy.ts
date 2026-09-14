import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseMiddlewareClient } from "@/lib/supabase/server";

export async function proxy(request: NextRequest) {
  const { supabase, response } = getSupabaseMiddlewareClient(request);

  if (!supabase) {
    return response;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && pathname.startsWith("/app")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/app/:path*", "/login"],
};

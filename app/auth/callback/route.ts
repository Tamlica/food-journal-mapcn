import { NextResponse, type NextRequest } from "next/server";

import { getSiteUrl, safeNext } from "@/lib/site-url";
import { getSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const siteUrl = getSiteUrl(request);
  const code = searchParams.get("code");
  const providerError = searchParams.get("error_description");
  const next = safeNext(searchParams.get("next"), "/app");

  if (code) {
    const supabase = await getSupabaseRouteHandlerClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${siteUrl}${next}`);
      }
      return NextResponse.redirect(
        `${siteUrl}/login?error=${encodeURIComponent(error.message)}`
      );
    }
  }

  // Provider-side failures (e.g. the Google identity is already linked to
  // another account) arrive here without a code.
  const message = providerError ?? "Google sign-in failed. Please try again.";
  return NextResponse.redirect(
    `${siteUrl}/login?error=${encodeURIComponent(message)}`
  );
}

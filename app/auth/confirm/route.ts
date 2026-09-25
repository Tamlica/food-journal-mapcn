import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { getSiteUrl, safeNext } from "@/lib/site-url";
import { getSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const siteUrl = getSiteUrl(request);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeNext(
    searchParams.get("next"),
    type === "recovery" ? "/reset-password" : "/app"
  );

  if (tokenHash && type) {
    const supabase = await getSupabaseRouteHandlerClient();
    if (supabase) {
      // Verifying server-side sets the session cookie, so the redirect below
      // carries no token params.
      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash: tokenHash,
      });
      if (!error) {
        return NextResponse.redirect(`${siteUrl}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${siteUrl}/login?error=confirmation_failed`);
}

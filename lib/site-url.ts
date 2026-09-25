import type { NextRequest } from "next/server";

/**
 * Public origin of the app, for building absolute redirect URLs on the server.
 *
 * Behind Netlify, `request.url` can resolve to the deploy permalink
 * (`<id>--<site>.netlify.app`) instead of the custom domain, so prefer an
 * explicit `SITE_URL`, then the forwarded host, then the request origin
 * (local dev).
 */
export function getSiteUrl(request?: NextRequest | Request) {
  const configured = process.env.SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  const forwardedHost = request?.headers
    .get("x-forwarded-host")
    ?.split(",")[0]
    .trim();
  if (forwardedHost) {
    const forwardedProto =
      request?.headers.get("x-forwarded-proto")?.split(",")[0].trim() ??
      "https";
    return `${forwardedProto}://${forwardedHost}`;
  }

  if (request) return new URL(request.url).origin;

  return "http://localhost:3000";
}

/** Only same-site relative paths; blocks absolute and protocol-relative URLs. */
export function safeNext(next: string | null | undefined, fallback: string) {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return fallback;
  }
  return next;
}

/** Public directory gateway: never forward caller credentials or administrative routes. */
const routes = new Set([
  "/api/contacts",
  "/api/contacts/count",
  "/api/contacts/search/name",
  "/api/contacts/search/phone",
  "/api/contacts/filter",
  "/api/contacts/blood-groups",
  "/api/contacts/lobbies",
  "/api/contacts/designations",
  "/api/contacts/by-blood-group",
  "/api/contacts/by-lobby",
  "/api/documents/all",
  "/api/documents/count",
  "/api/analytics/visits",
  "/api/analytics/visits/history",
  "/api/analytics/overview",
  "/api/analytics/blood-groups",
  "/api/analytics/lobbies",
  "/api/analytics/designations",
  "/api/analytics/growth",
  "/api/analytics/recent",
]);
const allowedQuery = new Set([
  "query",
  "page",
  "limit",
  "bloodGroup",
  "lobby",
  "designation",
  "days",
]);
function error(message: string, status: number) {
  return Response.json(
    { success: false, message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}
export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/\.netlify\/functions\/api/, "/api");
  const visit = path === "/api/analytics/visits" && request.method === "POST";
  if (!routes.has(path) || (request.method !== "GET" && !visit))
    return error("Route not available", 404);
  if (
    visit &&
    request.headers.get("origin") &&
    request.headers.get("origin") !== url.origin
  )
    return error("Origin not allowed", 403);
  // Compatibility is server-only: existing Netlify installations may still use
  // the previous variable names. Explicit WAT values always take precedence.
  const WAT_API_BASE_URL =
    process.env.WAT_API_BASE_URL ?? process.env.VITE_API_BASE_URL;
  const WAT_API_KEY = process.env.WAT_API_KEY ?? process.env.VITE_API_KEY;
  const WAT_API_USERNAME =
    process.env.WAT_API_USERNAME ?? process.env.VITE_API_USERNAME;
  const WAT_API_PASSWORD =
    process.env.WAT_API_PASSWORD ?? process.env.VITE_API_PASSWORD;
  const missing = Object.entries({
    WAT_API_BASE_URL,
    WAT_API_KEY,
    WAT_API_USERNAME,
    WAT_API_PASSWORD,
  })
    .filter(([, value]) => !value?.trim())
    .map(([key]) => key);
  if (missing.length) {
    console.error(
      "Directory gateway configuration missing:",
      missing.join(", "),
    );
    return error(
      "The directory is temporarily unavailable. Please try again later.",
      503,
    );
  }
  let upstream: URL;
  try {
    upstream = new URL(path, WAT_API_BASE_URL!.trim());
    if (upstream.protocol !== "https:")
      return error("Directory connection is not configured.", 503);
  } catch {
    return error("Directory connection is not configured.", 503);
  }
  for (const [key, value] of url.searchParams) {
    if (!allowedQuery.has(key) || value.length > 1000)
      return error("Invalid request parameters", 400);
    upstream.searchParams.append(key, value);
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetch(upstream, {
      method: request.method,
      redirect: "error",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-API-Key": WAT_API_KEY!,
        Authorization: `Basic ${Buffer.from(`${WAT_API_USERNAME}:${WAT_API_PASSWORD}`).toString("base64")}`,
      },
      ...(visit ? { body: "{}" } : {}),
    });
    if (!response.ok)
      return error(
        response.status === 429
          ? "Too many requests. Please try again shortly."
          : "The directory is temporarily unavailable. Please try again.",
        response.status === 429 ? 429 : 502,
      );
    const payload = await response.json();
    return Response.json(payload, {
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return error("The directory could not be reached. Please try again.", 502);
  } finally {
    clearTimeout(timeout);
  }
}

export const config = {
  rateLimit: {
    action: "rate_limit",
    aggregateBy: ["ip"],
    windowSize: 60,
    windowLimit: 180,
  },
};

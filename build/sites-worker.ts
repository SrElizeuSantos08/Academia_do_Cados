import { handleLms } from "../lib/lms.mjs";
import handler from "vinext/server/fetch-handler";
import { runWithConnectorBinding } from "../lib/connector-context";
import type { ConnectorBinding } from "../lib/connector-contract.mjs";
import { configureSupabaseRuntime } from "../lib/supabase-d1-adapter.mjs";

async function injectPrivacyNotice(request: Request, response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (!response.ok || request.method === "HEAD" || !contentType.includes("text/html")) return response;
  const html = await response.text();
  const bodyEnd = html.toLowerCase().lastIndexOf("</body>");
  if (bodyEnd < 0 || html.includes("/privacy-consent.js")) {
    const headers = new Headers(response.headers);
    headers.delete("content-length");
    headers.delete("content-encoding");
    headers.delete("etag");
    return new Response(html, { status: response.status, statusText: response.statusText, headers });
  }
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.delete("content-encoding");
  headers.delete("etag");
  headers.delete("content-md5");
  const updated = html.slice(0, bodyEnd) + '<script defer src="/privacy-consent.js"></script>' + html.slice(bodyEnd);
  return new Response(updated, { status: response.status, statusText: response.statusText, headers });
}


export default {
  async fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext<{ CONNECTORS?: ConnectorBinding }>) {
    if (new URL(request.url).pathname.startsWith("/api/lms/")) {
      try { return await handleLms(request, configureSupabaseRuntime(env)); }
      catch { return Response.json({ error: "A configuração segura do banco de dados está incompleta." }, { status: 503, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } }); }
    }
    let binding = ctx.props?.CONNECTORS;
    // Local preview emulates the same request-scoped capability. This branch and
    // the auxiliary service binding are absent from production builds.
    if (import.meta.env.DEV && !binding && env.CONNECTORS) {
      const preview = env.CONNECTORS;
      const expiresAt = Date.now() + 60_000;
      binding = {
        async getContext() {
          if (Date.now() >= expiresAt) return { status: "request_context_expired" };
          return preview.getContext?.() ?? { status: "binding_unavailable" };
        },
        async invoke(connectorId, actionName, args) {
          if (Date.now() >= expiresAt) {
            return { status: "request_context_expired", message: "This request has expired. Please try again." };
          }
          return preview.invoke(connectorId, actionName, args);
        },
      };
    }
    return runWithConnectorBinding(binding, async () => injectPrivacyNotice(request, await handler.fetch(request, env, ctx)));
  },
};

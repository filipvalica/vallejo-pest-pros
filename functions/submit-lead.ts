/**
 * Cloudflare Pages Function — POST /functions/submit-lead
 *
 * Handles lead form submissions. On success, redirects to /contact?submitted=true.
 * Optionally forwards to a portfolio agent webhook (set AGENT_WEBHOOK_URL env var).
 *
 * Deploy: included automatically when this file is in /functions/
 * Env vars (set in Cloudflare Pages dashboard):
 *   AGENT_WEBHOOK_URL — portfolio agent ingest URL (optional)
 *   PORTFOLIO_ID      — matches siteConfig.portfolioId; used as lead source tag
 */

interface Env {
  AGENT_WEBHOOK_URL?: string;
  PORTFOLIO_ID?: string;
}

export async function onRequestPost(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const { request, env } = context;

  let data: FormData;
  try {
    data = await request.formData();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const lead = {
    name:      data.get("name")?.toString().trim() ?? "",
    phone:     data.get("phone")?.toString().trim() ?? "",
    email:     data.get("email")?.toString().trim() ?? "",
    message:   data.get("message")?.toString().trim() ?? "",
    source:    request.headers.get("referer") ?? "",
    timestamp: new Date().toISOString(),
    siteId:    env.PORTFOLIO_ID ?? "unknown",
    // TrustedForm certificate for TCPA compliance
    trustedFormToken: data.get("xxTrustedFormToken")?.toString() ?? "",
  };

  // Basic validation — phone is required
  if (!lead.phone) {
    return Response.redirect(
      new URL("/contact?error=missing-phone", request.url).href,
      303,
    );
  }

  // Forward to portfolio agent webhook if configured
  if (env.AGENT_WEBHOOK_URL) {
    try {
      await fetch(env.AGENT_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });
    } catch {
      // Log failure but don't block the user redirect
      console.error("Failed to forward lead to webhook");
    }
  }

  return Response.redirect(
    new URL("/contact?submitted=true", request.url).href,
    303,
  );
}

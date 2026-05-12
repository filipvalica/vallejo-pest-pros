/**
 * Cloudflare Pages Function — POST /functions/submit-lead
 *
 * Handles lead form submissions. On success, redirects to /contact?submitted=true.
 * Optionally forwards to a portfolio agent webhook (set AGENT_WEBHOOK_URL env var).
 * Sends email notification via Resend when RESEND_API_KEY + NOTIFICATION_EMAIL are set.
 *
 * Deploy: included automatically when this file is in /functions/
 * Env vars (set in Cloudflare Pages dashboard):
 *   AGENT_WEBHOOK_URL  — portfolio agent ingest URL (optional)
 *   PORTFOLIO_ID       — matches siteConfig.portfolioId; used as lead source tag
 *   RESEND_API_KEY     — Resend API key (re_xxxx...)
 *   NOTIFICATION_EMAIL — destination email (e.g. filip.valica@gmail.com)
 */

interface Env {
  AGENT_WEBHOOK_URL?: string;
  PORTFOLIO_ID?: string;
  RESEND_API_KEY?: string;
  NOTIFICATION_EMAIL?: string;
}

function htmlEscape(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
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
      console.error("Failed to forward lead to webhook");
    }
  }

  // Send email notification via Resend
  if (env.RESEND_API_KEY && env.NOTIFICATION_EMAIL) {
    const subject = `[${lead.siteId}] New Lead — ${lead.name} | ${lead.phone}`;
    const html = `
<table style="font-family:sans-serif;font-size:14px;color:#111;max-width:560px">
  <tr><td style="padding:16px 0;border-bottom:1px solid #e5e7eb">
    <strong style="font-size:18px">New lead from ${htmlEscape(lead.siteId)}</strong>
  </td></tr>
  <tr><td style="padding:12px 0">
    <table style="width:100%;border-collapse:collapse">
      <tr><td style="padding:6px 0;width:120px;color:#6b7280">Name</td><td style="padding:6px 0;font-weight:600">${htmlEscape(lead.name)}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280">Phone</td><td style="padding:6px 0;font-weight:600">${htmlEscape(lead.phone)}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280">Email</td><td style="padding:6px 0">${htmlEscape(lead.email) || "—"}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280;vertical-align:top">Message</td><td style="padding:6px 0">${htmlEscape(lead.message) || "—"}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280">Source URL</td><td style="padding:6px 0;font-size:12px">${htmlEscape(lead.source)}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280">Submitted</td><td style="padding:6px 0;font-size:12px">${htmlEscape(lead.timestamp)}</td></tr>
      ${lead.trustedFormToken ? `<tr><td style="padding:6px 0;color:#6b7280">TrustedForm</td><td style="padding:6px 0;font-size:11px;color:#9ca3af">${htmlEscape(lead.trustedFormToken)}</td></tr>` : ""}
    </table>
  </td></tr>
</table>`;

    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "onboarding@resend.dev",
          to: [env.NOTIFICATION_EMAIL],
          subject,
          html,
        }),
      });
    } catch {
      console.error("Failed to send Resend notification");
    }
  }

  return Response.redirect(
    new URL("/contact?submitted=true", request.url).href,
    303,
  );
}

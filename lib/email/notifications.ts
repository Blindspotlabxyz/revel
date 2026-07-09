import {
  getAdminNotifyEmail,
  sendEmailAsync,
} from "@/lib/email/resend";
import { siteConfig } from "@/lib/site-config";

function layout(content: string): string {
  return `
    <div style="font-family:system-ui,sans-serif;line-height:1.6;color:#1a1a1a;max-width:560px">
      <p style="margin:0 0 8px;font-size:13px;color:#6b6b6b">Revel by BlindspotLab</p>
      ${content}
      <p style="margin:24px 0 0;font-size:12px;color:#8a8a8a">
        <a href="${siteConfig.url}" style="color:#c45c26">${siteConfig.url}</a>
        · Reveal what others miss.
      </p>
    </div>
  `.trim();
}

export function notifyPartnerApplicationReceived(input: {
  name: string;
  contactEmail: string;
  domain?: string | null;
}): void {
  sendEmailAsync({
    to: input.contactEmail,
    subject: "We received your Revel Partner API application",
    html: layout(`
      <h1 style="font-size:20px;margin:0 0 12px">Application received</h1>
      <p>Thanks for applying to integrate <strong>${input.name}</strong> with Revel.</p>
      <p>We review partner applications manually. You'll receive another email when your account is approved and your API key is ready.</p>
      <p style="margin-top:16px;font-size:14px;color:#6b6b6b">
        Docs: <a href="${siteConfig.url}/partners">${siteConfig.url}/partners</a>
      </p>
    `),
    text: `We received your Revel Partner API application for ${input.name}. We'll email you when approved.`,
  });

  sendEmailAsync({
    to: getAdminNotifyEmail(),
    subject: `[Revel] New partner application: ${input.name}`,
    html: layout(`
      <h1 style="font-size:20px;margin:0 0 12px">New partner application</h1>
      <ul style="padding-left:18px">
        <li><strong>Platform:</strong> ${input.name}</li>
        <li><strong>Email:</strong> ${input.contactEmail}</li>
        <li><strong>Domain:</strong> ${input.domain ?? "—"}</li>
      </ul>
      <p><a href="${siteConfig.url}/mission-control/partners">Review in Mission Control → Partners</a></p>
    `),
  });
}

export function notifyPartnerApproved(input: {
  name: string;
  contactEmail: string;
  accessType: string;
}): void {
  const accessLabel =
    input.accessType === "whitelisted"
      ? "whitelisted (no per-call charge)"
      : input.accessType === "trial"
        ? "trial access"
        : "paid credits";

  sendEmailAsync({
    to: input.contactEmail,
    subject: "Welcome to the Revel Partner API",
    html: layout(`
      <h1 style="font-size:20px;margin:0 0 12px">You're approved</h1>
      <p><strong>${input.name}</strong> is now active on the Revel Partner API (${accessLabel}).</p>
      <p>Your API key will arrive in a separate email when issued, or was shared with you directly by our team.</p>
      <p><strong>Quick start</strong></p>
      <ul style="padding-left:18px">
        <li>Health: <code>GET ${siteConfig.url}/api/partner/v1/health</code></li>
        <li>Analyze: <code>POST ${siteConfig.url}/api/partner/v1/analyze</code></li>
        <li>Poll: <code>GET ${siteConfig.url}/api/partner/v1/report/:id</code></li>
      </ul>
      <p>Full docs: <a href="${siteConfig.url}/partners">${siteConfig.url}/partners</a></p>
    `),
    text: `${input.name} is approved on the Revel Partner API. Docs: ${siteConfig.url}/partners`,
  });
}

export function notifyPartnerApiKeyIssued(input: {
  name: string;
  contactEmail: string;
  apiKey: string;
  keyPrefix: string;
}): void {
  sendEmailAsync({
    to: input.contactEmail,
    subject: "Your Revel Partner API key",
    html: layout(`
      <h1 style="font-size:20px;margin:0 0 12px">API key for ${input.name}</h1>
      <p>Store this key securely on your server. It is not shown again in Revel.</p>
      <pre style="background:#f4f1ea;padding:12px;border-radius:8px;font-size:13px;overflow-x:auto">${input.apiKey}</pre>
      <p style="font-size:13px;color:#6b6b6b">Prefix: ${input.keyPrefix}</p>
      <p>Set <code>REVEL_PARTNER_API_KEY</code> in your server environment. Never expose it in client-side code.</p>
      <p>Docs: <a href="${siteConfig.url}/partners">${siteConfig.url}/partners</a></p>
    `),
    text: `Your Revel Partner API key (prefix ${input.keyPrefix}): ${input.apiKey}`,
  });
}

export function notifyUserWelcome(input: { email: string }): void {
  sendEmailAsync({
    to: input.email,
    subject: "Welcome to Revel Mission Control",
    html: layout(`
      <h1 style="font-size:20px;margin:0 0 12px">Welcome to Revel</h1>
      <p>Your account is ready. Run your first product audit in Mission Control — 3 free audits per week during early access.</p>
      <p><a href="${siteConfig.url}/mission-control" style="display:inline-block;margin-top:8px;padding:10px 18px;background:#c45c26;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Open Mission Control</a></p>
      <p style="margin-top:16px;font-size:14px;color:#6b6b6b">Need more volume? Integrate via the <a href="${siteConfig.url}/partners">Partner API</a> or OKX.AI marketplace.</p>
    `),
    text: `Welcome to Revel. Open Mission Control: ${siteConfig.url}/mission-control`,
  });
}
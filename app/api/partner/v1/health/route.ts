import { getOkxAuditPriceUsd } from "@/lib/billing/okx-x402";
import { siteConfig } from "@/lib/site-config";

export const runtime = "nodejs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Revel-Partner-Key",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  return Response.json(
    {
      service: "revel-partner-api",
      version: "1.0.0",
      docs: `${siteConfig.url}/partners`,
      endpoints: {
        analyze: "POST /api/partner/v1/analyze",
        report: "GET /api/partner/v1/report/:analysisId",
      },
      auth: {
        header: "Authorization: Bearer rvl_pk_...",
        alternate: "X-Revel-Partner-Key: rvl_pk_...",
      },
      pricing: {
        paidPerAuditUsd: getOkxAuditPriceUsd(),
        whitelisted: "Admin-approved partners (e.g. Arcapush) — no per-call charge",
        paid: "Requires prepaid credits on partner account",
      },
    },
    { headers: corsHeaders }
  );
}
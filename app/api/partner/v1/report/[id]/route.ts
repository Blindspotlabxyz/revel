import { NextResponse } from "next/server";
import {
  authenticatePartnerRequest,
  partnerUnauthorizedResponse,
} from "@/lib/partner-auth";
import { partnerOwnsAnalysis } from "@/lib/partners";
import { getAnalysis } from "@/services/store";

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const partner = await authenticatePartnerRequest(request);
  if (!partner) {
    return withCors(partnerUnauthorizedResponse());
  }

  const { id } = await params;

  const owns = await partnerOwnsAnalysis(partner.id, id);
  if (!owns) {
    return withCors(
      NextResponse.json({ error: "Report not found" }, { status: 404 })
    );
  }

  const analysis = await getAnalysis(id);
  if (!analysis) {
    return withCors(
      NextResponse.json({ error: "Report not found" }, { status: 404 })
    );
  }

  return withCors(NextResponse.json(analysis));
}

function withCors(response: Response): NextResponse {
  const next = new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
  for (const [key, value] of Object.entries(corsHeaders)) {
    next.headers.set(key, value);
  }
  return next;
}
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** GET /api/ideas/:id/explain — AI disabled */
export async function GET() {
  return NextResponse.json({ error: "AI explanations are disabled." }, { status: 404 });
}

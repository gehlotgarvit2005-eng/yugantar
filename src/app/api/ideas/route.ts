import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

/** GET /api/ideas — List all ideas sorted by upvotes */
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("ideas")
    .select("*")
    .order("upvotes", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ideas: data ?? [] });
}

/** POST /api/ideas — Submit a new idea (no AI yet, that comes on detail page) */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, author, era } = body;

    if (!text?.trim() || !author?.trim() || !era) {
      return NextResponse.json(
        { error: "text, author, and era are required" },
        { status: 400 },
      );
    }

    if (!["fire", "night", "sun"].includes(era)) {
      return NextResponse.json(
        { error: 'era must be "fire", "night", or "sun"' },
        { status: 400 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("ideas")
      .insert({
        text: text.trim(),
        author: author.trim(),
        era,
        upvotes: 0,
        featured: false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ idea: data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}

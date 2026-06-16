import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

/** POST /api/ideas/:id/vote — Upvote an idea */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Atomic increment
  const { data, error } = await supabaseAdmin.rpc("increment_upvotes", {
    idea_id: id,
  });

  if (error) {
    // Fallback: try direct update (works if rpc doesn't exist)
    const { data: idea, error: fetchError } = await supabaseAdmin
      .from("ideas")
      .select("upvotes")
      .eq("id", id)
      .single();

    if (fetchError || !idea) {
      return NextResponse.json({ error: "Idea not found" }, { status: 404 });
    }

    const newCount = (idea.upvotes ?? 0) + 1;
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("ideas")
      .update({ upvotes: newCount })
      .eq("id", id)
      .select("upvotes")
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ upvotes: updated.upvotes });
  }

  return NextResponse.json({ upvotes: data ?? 0 });
}

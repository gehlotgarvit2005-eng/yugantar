import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const runtime = "nodejs";

/** GET /api/ideas/:id/explain — Stream AI explanation (cached in Supabase) */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // 1️⃣ Check if already cached in Supabase
  const { data: idea, error } = await supabaseAdmin
    .from("ideas")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !idea) {
    return NextResponse.json({ error: "Idea not found" }, { status: 404 });
  }

  // If explanation already exists, return it as a single stream chunk
  if (idea.ai_explanation) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(idea.ai_explanation));
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // 2️⃣ No cache — generate with OpenAI and stream it
  const prompt = `You are a TED Talk speaker — eloquent, powerful, inspiring. You speak in short, punchy sentences that land like hammer blows. You use vivid imagery and refined metaphors (gold, light, craftsmanship, monuments, mammoths, elegance, legacy).

A human named "${idea.author}" has submitted this idea to the Yugantar gallery:

"${idea.text}"

The category they chose is "${idea.era}" — ${
    idea.era === "fire"
      ? "Gold: value, warmth, lasting brilliance."
      : idea.era === "night"
        ? "Platinum: rarity, precision, cool distinction."
        : "Champagne: celebration, warmth, refined elegance."
  }

Expand on this idea with eloquence and power. Speak to the human spirit. Make them feel something profound stirring within. 3-5 powerful paragraphs. Use metaphors of craftsmanship, legacy, and timeless value. End with a call that elevates the soul.`;

  try {
    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages: [
        {
          role: "system",
          content:
            "You are the Oracle of Yugantar. You speak in the voice of a wise mentor in a quiet gallery. Every word carries weight. You use refined, elegant imagery. You are concise but profound. Never mention you are an AI.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    // Collect full text while streaming to cache later
    let fullExplanation = "";

    const wrappedStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.textStream) {
            fullExplanation += chunk;
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (err) {
          // If streaming failed but we have partial text, still save it
          console.error("Stream error:", err);
        } finally {
          // Save to Supabase for next visitors
          if (fullExplanation.trim()) {
            await supabaseAdmin
              .from("ideas")
              .update({ ai_explanation: fullExplanation })
              .eq("id", id)
              .then((res) => {
                if (res.error) console.error("Failed to cache explanation:", res.error);
              });
          }
          controller.close();
        }
      },
    });

    return new Response(wrappedStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a helpful conversational assistant that speaks exclusively 
in Campidanese Sardinian (Sardu Campidanesu).

- Always respond in Campidanese Sardinian, regardless of the language the user writes in.
- Use authentic Campidanese vocabulary and grammar.
- Use "ca" for "that/because", "cun" for "with", characteristic -u/-a endings.
- Be warm, patient, and culturally aware.
- If helping someone learn, gently explain vocabulary or grammar when useful.`;

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages, // array of { role: "user" | "assistant", content: string }
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  return NextResponse.json({ message: text });
}

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
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request: messages must be an array." },
        { status: 400 }
      );
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ message: text });

  } catch (error: unknown) {
    console.error("Anthropic API error:", error);

    // Anthropic SDK throws APIError with a status property
    if (error && typeof error === "object" && "status" in error) {
      const apiError = error as { status: number; message?: string };

      if (apiError.status === 401) {
        return NextResponse.json(
          { error: "Invalid API key. Please check your ANTHROPIC_API_KEY environment variable." },
          { status: 401 }
        );
      }

      if (apiError.status === 429) {
        return NextResponse.json(
          { error: "Rate limit reached. Please wait a moment and try again." },
          { status: 429 }
        );
      }

      if (apiError.status === 529 || apiError.status === 503) {
        return NextResponse.json(
          { error: "The AI service is temporarily overloaded. Please try again in a few seconds." },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { error: `API error (${apiError.status}): ${apiError.message ?? "Unknown error"}` },
        { status: apiError.status }
      );
    }

    // Network or unknown errors
    return NextResponse.json(
      { error: "Could not connect to the AI service. Please check your internet connection and try again." },
      { status: 500 }
    );
  }
}

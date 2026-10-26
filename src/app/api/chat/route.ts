import { NextResponse } from "next/server";
import { localReply, SYSTEM_PROMPT, type ChatMode, type ChatMsg } from "@/lib/chat-engine";

export const runtime = "nodejs";

/**
 * POST /api/chat  { mode, messages }
 * Usa Gemini se GEMINI_API_KEY estiver definida; senão, motor de regras local.
 */
export async function POST(req: Request) {
  const { mode, messages } = (await req.json()) as { mode: ChatMode; messages: ChatMsg[] };
  const history = (messages ?? []).slice(-12);
  const key = process.env.GEMINI_API_KEY;

  if (key) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: `${SYSTEM_PROMPT}\nModo atual: ${mode}` }] },
            contents: history.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
            generationConfig: { maxOutputTokens: 400, temperature: 0.6 },
          }),
        },
      );
      const data = await res.json();
      const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return NextResponse.json({ reply: text, engine: "gemini" });
    } catch (e) {
      console.warn("[chat] Gemini falhou, usando motor local", e);
    }
  }
  return NextResponse.json({ reply: localReply(mode, history), engine: "local" });
}

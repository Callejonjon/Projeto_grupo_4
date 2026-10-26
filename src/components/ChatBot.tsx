"use client";
import { useEffect, useRef, useState } from "react";
import { BookOpen, FileText, Heart, Mic, Send, Sparkles, X } from "lucide-react";
import { localReply, type ChatMode, type ChatMsg } from "@/lib/chat-engine";

const MODES: { id: ChatMode; label: string; icon: typeof BookOpen; starter: string }[] = [
  { id: "economes", label: "Tradutora de Economês", icon: BookOpen, starter: "O que é Selic?" },
  { id: "curriculo", label: "Revisar Currículo", icon: FileText, starter: "Quero revisar meu currículo" },
  { id: "entrevista", label: "Simular Entrevista", icon: Mic, starter: "Quero simular uma entrevista" },
];

/** Renderiza **negrito** e *itálico* de forma segura (sem dangerouslySetInnerHTML). */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <p key={i} className={i ? "mt-1.5" : ""}>
          {line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, j) =>
            part.startsWith("**") ? <strong key={j}>{part.slice(2, -2)}</strong>
              : part.startsWith("*") && part.length > 2 ? <em key={j}>{part.slice(1, -1)}</em>
              : <span key={j}>{part}</span>)}
        </p>
      ))}
    </>
  );
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>("economes");
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "assistant", content: "Oi! Eu sou a **Mentora Virtual** do Grupo 4. 💗 Este é um espaço seguro: pergunte o que quiser, sem julgamentos. Escolha um modo abaixo ou digite sua dúvida." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open]);
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

  async function send(text: string, m: ChatMode = mode) {
    if (!text.trim() || loading) return;
    const next = [...messages, { role: "user" as const, content: text.trim() }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: m, messages: next }) });
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([...next, { role: "assistant", content: localReply(m, next) }]); // offline
    } finally {
      setLoading(false);
    }
  }

  function switchMode(m: (typeof MODES)[number]) {
    setMode(m.id);
    send(m.starter, m.id);
  }

  return (
    <>
      <button onClick={() => setOpen((o) => !o)} aria-label={open ? "Fechar Mentora Virtual" : "Abrir Mentora Virtual"} aria-expanded={open}
        className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-pink-500 text-white shadow-xl shadow-pink-500/40 transition hover:scale-105 hover:bg-pink-600 focus-visible:outline-4 focus-visible:outline-pink-300">
        {open ? <X /> : <Heart className="fill-white" />}
        {!open && <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-solar-400" aria-hidden />}
      </button>

      {open && (
        <section role="dialog" aria-label="Mentora Virtual - Espaço Seguro"
          className="fixed bottom-24 right-3 z-40 flex h-[min(600px,75vh)] w-[calc(100vw-1.5rem)] max-w-sm animate-fade-in flex-col overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-2xl sm:right-5">
          <header className="bg-gradient-to-r from-pink-500 to-pink-600 px-5 py-4 text-white">
            <p className="flex items-center gap-2 font-bold"><Sparkles size={18} /> Mentora Virtual</p>
            <p className="text-xs text-white/85">Espaço seguro · sem julgamentos · 24h</p>
          </header>

          <div className="flex gap-1.5 overflow-x-auto border-b border-slate-100 px-3 py-2">
            {MODES.map((m) => (
              <button key={m.id} onClick={() => switchMode(m)}
                className={`chip shrink-0 border ${mode === m.id ? "border-pink-500 bg-pink-50 text-pink-600" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                <m.icon size={12} /> {m.label}
              </button>
            ))}
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 px-4 py-4 text-sm" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                  m.role === "user" ? "rounded-br-sm bg-navy-800 text-white" : "rounded-bl-sm bg-white text-slate-700 shadow-sm ring-1 ring-slate-100"}`}>
                  <Rich text={m.content} />
                </div>
              </div>
            ))}
            {loading && <div className="w-16 rounded-2xl bg-white px-3 py-2 text-slate-400 shadow-sm">•••</div>}
            <div ref={endRef} />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-end gap-2 border-t border-slate-100 p-3">
            <label htmlFor="chat-input" className="sr-only">Sua mensagem</label>
            <textarea id="chat-input" ref={inputRef} rows={1} value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder={mode === "curriculo" ? "Cole um trecho do seu currículo..." : mode === "entrevista" ? "Sua resposta..." : "Ex.: o que é EBITDA?"}
              className="input max-h-28 resize-none" />
            <button type="submit" className="btn-primary h-10 w-10 shrink-0 !p-0" aria-label="Enviar" disabled={loading || !input.trim()}><Send size={16} /></button>
          </form>
        </section>
      )}
    </>
  );
}

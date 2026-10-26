"use client";
import { useState } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { PASS_SCORE } from "@/lib/engine";
import { useStore } from "@/lib/store";
import type { Module } from "@/lib/types";
import { ProgressBar } from "./ui";

/** Motor de quiz: uma pergunta por vez, feedback imediato, nota mínima de 70% para aprovar. */
export default function Quiz({ module, onClose }: { module: Module; onClose: () => void }) {
  const { submitQuiz } = useStore();
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState<{ score: number; passed: boolean } | null>(null);

  const q = module.quiz[i];
  const total = module.quiz.length;

  function confirm(opt: number) {
    if (picked !== null) return;
    setPicked(opt);
    if (opt === q.answer) setCorrect((c) => c + 1);
  }

  function next() {
    if (i + 1 < total) { setI(i + 1); setPicked(null); return; }
    const score = Math.round((correct / total) * 100);
    const { passed } = submitQuiz(module.id, score);
    setFinished({ score, passed });
  }

  function retry() { setI(0); setPicked(null); setCorrect(0); setFinished(null); }

  if (finished) {
    return (
      <div className="text-center" aria-live="polite">
        {finished.passed ? <CheckCircle2 size={56} className="mx-auto text-solar-500" /> : <XCircle size={56} className="mx-auto text-pink-500" />}
        <p className="mt-3 text-4xl font-extrabold">{finished.score}%</p>
        <p className="mt-1 text-sm text-slate-600">
          {finished.passed ? "Aprovada! Módulo concluído." : `Faltou pouco: a nota mínima é ${PASS_SCORE}%. Revise o conteúdo e tente de novo, sem pressa. 💗`}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          {!finished.passed && <button className="btn-secondary" onClick={retry}><RotateCcw size={16} /> Tentar novamente</button>}
          <button className="btn-primary" onClick={onClose}>{finished.passed ? "Voltar aos módulos" : "Rever conteúdo"}</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
        <span>Pergunta {i + 1} de {total}</span><span>Nota mínima: {PASS_SCORE}%</span>
      </div>
      <ProgressBar value={(i / total) * 100} label="Progresso do quiz" className="mb-5" />
      <h3 className="text-lg font-bold" id="quiz-q">{q.q}</h3>
      <div role="radiogroup" aria-labelledby="quiz-q" className="mt-4 space-y-2">
        {q.options.map((o, k) => {
          const isAns = k === q.answer;
          const state = picked === null ? "border-slate-200 hover:border-pink-400 hover:bg-pink-50/50"
            : isAns ? "border-emerald-500 bg-emerald-50" : picked === k ? "border-rose-400 bg-rose-50" : "border-slate-200 opacity-60";
          return (
            <button key={k} role="radio" aria-checked={picked === k} onClick={() => confirm(k)} disabled={picked !== null}
              className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left text-sm transition ${state}`}>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-bold">{String.fromCharCode(65 + k)}</span>
              {o}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="mt-4 animate-fade-in rounded-xl bg-slate-50 p-3 text-sm text-slate-700" aria-live="polite">
          <strong>{picked === q.answer ? "✅ Isso mesmo!" : "💡 Quase!"}</strong> {q.explain}
        </div>
      )}
      <div className="mt-6 flex justify-end">
        <button className="btn-primary" onClick={next} disabled={picked === null}>{i + 1 < total ? "Próxima" : "Ver resultado"}</button>
      </div>
    </div>
  );
}

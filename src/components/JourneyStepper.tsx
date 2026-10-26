"use client";
import Link from "next/link";
import { Check, Lock } from "lucide-react";
import { useStore } from "@/lib/store";

export const STAGES = [
  { n: 1, title: "Inscrição e diagnóstico", desc: "Cadastro, questionário e definição da trilha", href: "/onboarding" },
  { n: 2, title: "Formação básica", desc: "Conceitos técnicos, áreas do mercado e soft skills", href: "/cursos" },
  { n: 3, title: "Mentoria e networking", desc: "Match com mentora, eventos e comunidade", href: "/mentoria" },
  { n: 4, title: "Preparação para processos", desc: "Currículo, LinkedIn e simulação de entrevistas", href: "/cursos" },
  { n: 5, title: "Conclusão e oportunidades", desc: "Plano de carreira, vagas ou novo ciclo", href: "/vagas" },
] as const;

/** Mini-trilha horizontal com as 5 etapas (usada no Dashboard). */
export default function JourneyStepper() {
  const { journey } = useStore();
  return (
    <ol className="grid grid-cols-5 gap-1 sm:gap-2" aria-label="Progresso nas 5 etapas">
      {STAGES.map((s) => {
        const done = journey.stagesDone[s.n];
        const current = journey.currentStage === s.n && !done;
        return (
          <li key={s.n} className="flex flex-col items-center text-center">
            <Link href={s.href} aria-label={`Etapa ${s.n}: ${s.title} — ${done ? "concluída" : current ? "em andamento" : "bloqueada"}`}
              className={`grid h-10 w-10 place-items-center rounded-full text-sm font-bold transition sm:h-12 sm:w-12 ${
                done ? "bg-solar-400 text-navy-950 shadow-md shadow-solar-500/30"
                  : current ? "bg-pink-500 text-white ring-4 ring-pink-200"
                  : "bg-slate-200 text-slate-400"}`}>
              {done ? <Check size={20} strokeWidth={3} /> : current ? s.n : <Lock size={16} />}
            </Link>
            <span className={`mt-2 hidden text-xs font-medium sm:block ${current ? "text-pink-600" : "text-slate-600"}`}>{s.title}</span>
          </li>
        );
      })}
    </ol>
  );
}

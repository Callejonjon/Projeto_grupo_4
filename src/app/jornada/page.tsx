"use client";
import Link from "next/link";
import { Check, Flag, Lock, Play, Trophy, Users } from "lucide-react";
import { useStore } from "@/lib/store";
import { STAGES } from "@/components/JourneyStepper";
import { PageHeader, ProgressBar, TrackBadge } from "@/components/ui";

const OFFSETS = ["sm:translate-x-0", "sm:translate-x-16", "sm:translate-x-28", "sm:translate-x-16", "sm:translate-x-0", "sm:-translate-x-16", "sm:-translate-x-28", "sm:-translate-x-16"];

/** Trilha visual estilo "mapa de fases": cada nó é um módulo; concluir sobe XP e libera o próximo. */
export default function Jornada() {
  const { modules, journey, profile, mentorRequests } = useStore();
  const total = modules.length + 2; // + etapa 1 + mentoria
  const done = journey.passed.size + (journey.stagesDone[1] ? 1 : 0) + (mentorRequests.length ? 1 : 0);
  let idx = 0;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Jornada gamificada" title="Minha trilha" subtitle="Conclua cada fase para ganhar XP, subir de nível e destravar a próxima etapa."
        action={<TrackBadge track={profile.track_type} />} />

      <div className="card mb-8 p-5">
        <div className="mb-2 flex justify-between text-sm"><span className="font-semibold">Progresso total</span><span className="text-slate-500">{done}/{total} fases</span></div>
        <ProgressBar value={(done / total) * 100} label="Progresso total da jornada" />
      </div>

      <div className="space-y-10">
        {STAGES.map((s) => {
          const stageDone = journey.stagesDone[s.n];
          const mods = modules.filter((m) => m.stage === s.n);
          return (
            <section key={s.n} aria-labelledby={`st-${s.n}`}>
              <div className={`flex items-center gap-3 rounded-2xl p-4 ${stageDone ? "bg-solar-400/15" : journey.currentStage === s.n ? "bg-pink-50" : "bg-slate-100"}`}>
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl font-bold ${stageDone ? "bg-solar-400 text-navy-950" : journey.currentStage === s.n ? "bg-pink-500 text-white" : "bg-slate-300 text-slate-500"}`}>
                  {stageDone ? <Check size={20} /> : s.n}
                </span>
                <div>
                  <h2 id={`st-${s.n}`} className="font-bold">Etapa {s.n}: {s.title}</h2>
                  <p className="text-xs text-slate-600">{s.desc}</p>
                </div>
              </div>

              <ol className="mt-6 flex flex-col items-center gap-6">
                {s.n === 1 && (
                  <Node offset={OFFSETS[idx++ % OFFSETS.length]} state={stageDone ? "done" : "open"} href="/onboarding" label="Inscrição e diagnóstico" icon={<Flag size={22} />} />
                )}
                {s.n === 3 && (
                  <Node offset={OFFSETS[idx++ % OFFSETS.length]} state={mentorRequests.length ? "done" : journey.stagesDone[2] ? "open" : "locked"}
                    href="/mentoria" label="Conectar com uma mentora" icon={<Users size={22} />} />
                )}
                {mods.map((m) => {
                  const state = journey.passed.has(m.id) ? "done" : journey.unlocked.has(m.id) ? "open" : "locked";
                  return <Node key={m.id} offset={OFFSETS[idx++ % OFFSETS.length]} state={state} href={`/cursos?m=${m.id}`} label={m.title}
                    sub={`${m.durationMin} min${m.partner ? ` · ${m.partner}` : ""}`} />;
                })}
                {s.n === 5 && (
                  <Node offset="" state={stageDone ? "done" : "locked"} href="/vagas" label="Ciclo concluído: vá para as vagas!" icon={<Trophy size={22} />} />
                )}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function Node({ state, href, label, sub, icon, offset }: { state: "done" | "open" | "locked"; href: string; label: string; sub?: string; icon?: React.ReactNode; offset: string }) {
  const circle = state === "done" ? "bg-solar-400 text-navy-950 shadow-lg shadow-solar-500/40 border-b-4 border-solar-500"
    : state === "open" ? "bg-pink-500 text-white shadow-lg shadow-pink-500/40 border-b-4 border-pink-600 ring-8 ring-pink-200/60 animate-pulse"
    : "bg-slate-200 text-slate-400 border-b-4 border-slate-300";
  const content = (
    <>
      <span className={`grid h-16 w-16 place-items-center rounded-full transition group-hover:scale-105 ${circle}`}>
        {state === "done" ? <Check size={28} strokeWidth={3} /> : state === "locked" ? <Lock size={22} /> : icon ?? <Play size={24} className="fill-white" />}
      </span>
      <span className="mt-2 block max-w-[200px] text-center text-sm font-semibold text-navy-950">{label}</span>
      {sub && <span className="block text-center text-xs text-slate-500">{sub}</span>}
    </>
  );
  return (
    <li className={`flex flex-col items-center transition ${offset}`}>
      {state === "locked"
        ? <div className="group flex flex-col items-center opacity-70" aria-label={`${label} (bloqueado)`}>{content}</div>
        : <Link href={href} className="group flex flex-col items-center" aria-label={`${label} (${state === "done" ? "concluído" : "disponível"})`}>{content}</Link>}
    </li>
  );
}

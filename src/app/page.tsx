"use client";
import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Briefcase, CalendarDays, GraduationCap, Star, Users } from "lucide-react";
import { useStore } from "@/lib/store";
import { EVENTS, MENTORS } from "@/lib/mock-data";
import { jobCompatibility, LEVEL_NAMES, levelProgress, mentorAffinity } from "@/lib/engine";
import GiroMercado from "@/components/GiroMercado";
import MuralVagas from "@/components/MuralVagas";
import JourneyStepper, { STAGES } from "@/components/JourneyStepper";
import { MatchBadge, ProgressBar, TrackBadge } from "@/components/ui";
import { fmtDayMonth } from "@/lib/format";

export default function Dashboard() {
  const { profile, modules, journey, skills, jobs, onboarded } = useStore();
  const lp = levelProgress(profile.xp);
  const nextModule = modules.find((m) => journey.unlocked.has(m.id) && !journey.passed.has(m.id));
  const stage = STAGES[journey.currentStage - 1];
  const firstName = profile.name.split(" ")[0];

  const topMentor = useMemo(
    () => MENTORS.map((m) => mentorAffinity(profile, m, skills)).sort((a, b) => b.score - a.score)[0],
    [profile, skills]);
  const topJobs = useMemo(
    () => jobs.map((j) => ({ job: j, m: jobCompatibility(j, skills, profile.track_type) })).sort((a, b) => b.m.pct - a.m.pct).slice(0, 3),
    [jobs, skills, profile.track_type]);
  const nextEvent = EVENTS.find((e) => !profile.track_type || e.tracks.includes(profile.track_type));

  return (
    <>
      <GiroMercado />

      {!onboarded && (
        <div className="card mb-6 flex flex-col items-start gap-3 border-pink-200 bg-pink-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-navy-950"><strong>Comece pela Etapa 1:</strong> faça seu diagnóstico para descobrir sua trilha.</p>
          <Link href="/onboarding" className="btn-primary">Fazer diagnóstico <ArrowRight size={16} /></Link>
        </div>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-950 to-navy-800 p-6 text-white sm:p-8">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-pink-500/25 blur-3xl" aria-hidden />
        <div className="relative grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div>
            <TrackBadge track={profile.track_type} />
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Olá, {firstName}! 👋</h1>
            <p className="mt-2 max-w-lg text-white/80">
              Você está na <strong className="text-solar-400">Etapa {journey.currentStage}: {stage.title}</strong>. {stage.desc}.
            </p>
            {nextModule ? (
              <Link href={`/cursos?m=${nextModule.id}`} className="btn-primary mt-5">
                Continuar: {nextModule.title} <ArrowRight size={16} />
              </Link>
            ) : journey.currentStage === 3 ? (
              <Link href="/mentoria" className="btn-primary mt-5">Encontrar minha mentora <ArrowRight size={16} /></Link>
            ) : (
              <Link href="/vagas" className="btn-primary mt-5">Ver vagas compatíveis <ArrowRight size={16} /></Link>
            )}
          </div>
          <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15 backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Nível {lp.level} de 5</span>
              <span className="flex gap-0.5" aria-label={`Nível ${lp.level}`}>
                {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={16} className={n <= lp.level ? "fill-solar-400 text-solar-400" : "text-white/25"} />)}
              </span>
            </div>
            <p className="mt-1 text-2xl font-bold">{LEVEL_NAMES[lp.level - 1]}</p>
            <ProgressBar value={lp.pct} label="Progresso para o próximo nível" className="mt-3 bg-white/15" />
            <p className="mt-2 text-xs text-white/70">{lp.isMax ? "Nível máximo atingido! 🎉" : `${profile.xp} / ${lp.next} XP para o nível ${lp.level + 1}`}</p>
          </div>
        </div>
      </section>

      {/* Jornada */}
      <section className="card mt-6 p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold">Sua jornada em 5 etapas</h2>
          <Link href="/jornada" className="text-sm font-semibold text-pink-600 hover:underline">Ver trilha completa</Link>
        </div>
        <JourneyStepper />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Mentora recomendada */}
        <section className="card p-6">
          <h2 className="flex items-center gap-2 font-bold"><Users size={18} className="text-pink-500" /> Mentora recomendada</h2>
          <div className="mt-4 flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-pink-100 font-bold text-pink-600">{topMentor.mentor.initials}</span>
            <div className="min-w-0">
              <p className="font-semibold">{topMentor.mentor.mentor_name}</p>
              <p className="truncate text-xs text-slate-500">{topMentor.mentor.mentor_role}</p>
            </div>
          </div>
          <div className="mt-3"><MatchBadge pct={topMentor.score} label="afinidade" /></div>
          <p className="mt-3 text-sm text-slate-600">{topMentor.reasons[0]}</p>
          <Link href="/mentoria" className="btn-secondary mt-4 w-full">Ver todas as mentoras</Link>
        </section>

        {/* Vagas */}
        <section className="card p-6">
          <h2 className="flex items-center gap-2 font-bold"><Briefcase size={18} className="text-pink-500" /> Vagas para você</h2>
          <ul className="mt-4 space-y-3">
            {topJobs.map(({ job, m }) => (
              <li key={job.id} className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{job.title}</p>
                  <p className="text-xs text-slate-500">{job.company} · {job.modality}</p>
                </div>
                <MatchBadge pct={m.pct} />
              </li>
            ))}
          </ul>
          <Link href="/vagas" className="btn-secondary mt-4 w-full">Abrir mural de vagas</Link>
        </section>

        {/* Agenda + progresso */}
        <section className="card p-6">
          <h2 className="flex items-center gap-2 font-bold"><CalendarDays size={18} className="text-pink-500" /> Próximo evento</h2>
          {nextEvent && (
            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <span className="chip bg-navy-800/10 text-navy-800">{nextEvent.kind}</span>
              <p className="mt-2 text-sm font-semibold">{nextEvent.title}</p>
              <p className="text-xs text-slate-500">
                {fmtDayMonth(nextEvent.starts_at)} · {nextEvent.location}
              </p>
            </div>
          )}
          <h3 className="mt-5 flex items-center gap-2 text-sm font-bold"><GraduationCap size={16} className="text-pink-500" /> Módulos concluídos</h3>
          <p className="mt-1 text-2xl font-extrabold">{journey.passed.size}<span className="text-base font-medium text-slate-400"> / {modules.length}</span></p>
          <ProgressBar value={(journey.passed.size / modules.length) * 100} label="Módulos concluídos" className="mt-2" />
        </section>
      </div>
      <div className="mt-8">
        <MuralVagas />
      </div>
    </>
  );
}

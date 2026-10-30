"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight, Award, BrainCircuit, Briefcase, ChevronRight, ExternalLink, GraduationCap, Linkedin, Repeat, Star, Users,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { AREAS, EVENTS, MENTORS } from "@/lib/mock-data";
import { AREA_SKILLS, jobCompatibility, LEVEL_NAMES, levelProgress, mentorAffinity } from "@/lib/engine";
import GiroMercado from "@/components/GiroMercado";
import MuralVagas from "@/components/MuralVagas";
import JourneyStepper, { STAGES } from "@/components/JourneyStepper";
import { MatchBadge, ProgressBar } from "@/components/ui";
import { fmtDay, fmtMonth, fmtTime } from "@/lib/format";

export default function Dashboard() {
  const { profile, modules, journey, skills, jobs, onboarded, updateProfile, applyJob } = useStore();
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
  const trackEvents = EVENTS.filter((e) => !profile.track_type || e.tracks.includes(profile.track_type));
  const nextEvent = trackEvents.find((e) => new Date(e.starts_at).getTime() >= Date.now()) ?? trackEvents[0];

  // Compatibilidade com o mercado: média das 3 vagas mais aderentes + cobertura de skills por área de interesse
  const overallMatch = topJobs.length ? Math.round(topJobs.reduce((sum, { m }) => sum + m.pct, 0) / topJobs.length) : 0;
  const areaCoverage = (profile.interests.length ? profile.interests : AREAS).slice(0, 3).map((area) => {
    const req = AREA_SKILLS[area];
    return { area, pct: Math.round((req.filter((s) => skills.has(s)).length / req.length) * 100) };
  });

  return (
    <>
      <GiroMercado />

      {!onboarded && (
        <div className="card mb-6 flex flex-col items-start gap-3 border-pink-200 bg-pink-50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-navy-950"><strong>Comece pela Etapa 1:</strong> faça seu diagnóstico para descobrir sua trilha.</p>
          <Link href="/onboarding" className="btn-primary">Fazer diagnóstico <ArrowRight size={16} /></Link>
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Hero */}
        <section className="relative flex-1 overflow-hidden rounded-3xl bg-gradient-to-br from-navy-950 to-navy-800 p-6 text-white shadow-xl sm:p-8">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-pink-500/25 blur-3xl" aria-hidden />
          <div className="relative flex h-full flex-col justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                {profile.track_type && (
                  <span className="chip border border-white/20 bg-white/10 font-bold text-white">
                    Trilha {profile.track_type} · {profile.track_type === "A" ? "Universitárias" : "Transição de Carreira"}
                  </span>
                )}
                {profile.track_type && (
                  <button onClick={() => updateProfile({ track_type: profile.track_type === "A" ? "B" : "A" })}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-pink-300 hover:text-white hover:underline">
                    <Repeat size={12} /> Trocar trilha
                  </button>
                )}
              </div>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Olá, {firstName}! 👋</h1>
              <p className="mt-2 max-w-lg text-white/80">
                Você está na <strong className="text-solar-400">Etapa {journey.currentStage}: {stage.title}</strong>. {stage.desc}.
              </p>
            </div>
            <div>
              {nextModule ? (
                <Link href={`/cursos?m=${nextModule.id}`} className="btn-primary shadow-lg shadow-pink-500/25">
                  Continuar: {nextModule.title} <ArrowRight size={16} />
                </Link>
              ) : journey.currentStage === 3 ? (
                <Link href="/mentoria" className="btn-primary shadow-lg shadow-pink-500/25">Encontrar minha mentora <ArrowRight size={16} /></Link>
              ) : (
                <Link href="/vagas" className="btn-primary shadow-lg shadow-pink-500/25">Ver vagas compatíveis <ArrowRight size={16} /></Link>
              )}
            </div>
          </div>
        </section>

        {/* Gamificação */}
        <section className="card flex w-full flex-col rounded-3xl p-6 lg:w-80">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400">
            <Award size={16} className="text-pink-500" /> Seu progresso
          </h2>
          <div className="mt-4 text-center">
            <div className="relative mx-auto grid h-24 w-24 place-items-center rounded-full border-4 border-slate-50 bg-gradient-to-tr from-navy-950 to-navy-800 shadow-inner">
              <span className="absolute -right-2 -top-2 grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-pink-500 font-bold text-white shadow-sm">
                {lp.level}
              </span>
              <Star size={32} className="fill-solar-400 text-solar-400" />
            </div>
            <p className="mt-4 text-xl font-bold text-navy-950">{LEVEL_NAMES[lp.level - 1]}</p>
            <p className="text-sm text-slate-500">
              {lp.isMax ? "Nível máximo atingido! 🎉" : `${profile.xp} / ${lp.next} XP para o nível ${lp.level + 1}`}
            </p>
          </div>
          <ProgressBar value={lp.pct} label="Progresso para o próximo nível" className="mt-4" />

          {profile.linkedin_url ? (
            <div className="mt-auto pt-5">
              <p className="flex items-center gap-2 text-sm font-bold"><GraduationCap size={16} className="text-pink-500" /> Módulos concluídos</p>
              <p className="mt-1 text-2xl font-extrabold">{journey.passed.size}<span className="text-base font-medium text-slate-400"> / {modules.length}</span></p>
            </div>
          ) : (
            <LinkedinPrompt />
          )}
        </section>
      </div>

      {/* Jornada */}
      <section className="card mt-6 rounded-3xl p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold">Sua jornada em 5 etapas</h2>
          <Link href="/jornada" className="text-sm font-semibold text-pink-600 hover:underline">Ver trilha completa</Link>
        </div>
        <JourneyStepper />
      </section>

      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Compatibilidade IA */}
        <section className="rounded-3xl border border-navy-800/40 bg-gradient-to-br from-slate-900 to-navy-950 p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold"><BrainCircuit size={20} className="text-pink-500" /> IA Grupo 4</h2>
            <span className="rounded border border-white/20 bg-white/10 px-2 py-1 text-xs">Modo privado</span>
          </div>
          <p className="mt-4 text-sm text-slate-300">
            Com base no seu perfil e nos quizzes aprovados, mapeamos sua compatibilidade com o mercado:
          </p>
          <p className="mt-4 flex items-end gap-3">
            <span className="bg-gradient-to-r from-pink-300 to-pink-500 bg-clip-text text-5xl font-bold text-transparent">{overallMatch}%</span>
            <span className="mb-1 text-sm text-slate-400">Match geral</span>
          </p>
          <ul className="mt-6 space-y-3">
            {areaCoverage.map(({ area, pct }) => <SkillBar key={area} name={area} pct={pct} />)}
          </ul>
        </section>

        {/* Vagas */}
        <section className="card flex flex-col rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold"><Briefcase size={18} className="text-pink-500" /> Vagas compatíveis</h2>
            <Link href="/vagas" className="text-xs font-bold text-pink-600 hover:underline">Ver todas</Link>
          </div>
          <ul className="mt-4 flex-1 space-y-3">
            {topJobs.map(({ job, m }) => (
              <li key={job.id} className="group rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:border-pink-200">
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 text-sm font-bold text-navy-950 transition-colors group-hover:text-pink-600">{job.title}</p>
                  <MatchBadge pct={m.pct} />
                </div>
                <p className="mt-1 text-xs text-slate-500">{job.company} · {job.location} · {job.modality}</p>
                <a href={job.source_url} target="_blank" rel="noreferrer" onClick={() => applyJob(job.id, m.pct)}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-pink-600 transition-all group-hover:gap-2">
                  Candidatar-se <ExternalLink size={12} />
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Recomendações */}
        <section className="card flex flex-col gap-4 rounded-3xl p-6">
          <h2 className="flex items-center gap-2 font-bold"><Users size={18} className="text-pink-500" /> Recomendações</h2>
          <Link href="/mentoria" className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 hover:border-pink-200">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-pink-100 font-bold text-pink-600">{topMentor.mentor.initials}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-navy-950">{topMentor.mentor.mentor_name}</p>
              <p className="truncate text-xs text-slate-500">Mentora · {topMentor.mentor.specialty}</p>
              <div className="mt-1"><MatchBadge pct={topMentor.score} label="afinidade" /></div>
            </div>
            <ChevronRight size={16} className="shrink-0 text-slate-400 group-hover:text-pink-600" />
          </Link>
          {nextEvent && (
            <Link href="/mentoria" className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 hover:border-pink-200">
              <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl border border-pink-100 bg-pink-50 text-pink-600">
                <span className="text-[10px] font-bold uppercase">{fmtMonth(nextEvent.starts_at)}</span>
                <span className="text-lg font-black leading-none">{fmtDay(nextEvent.starts_at)}</span>
              </span>
              <div className="min-w-0">
                <span className="chip bg-pink-50 px-2 py-0.5 text-[10px] font-bold text-pink-600">{nextEvent.kind}</span>
                <p className="mt-1 text-sm font-bold text-navy-950">{nextEvent.title}</p>
                <p className="mt-1 text-xs text-slate-500">{nextEvent.location} · {fmtTime(nextEvent.starts_at)}</p>
              </div>
            </Link>
          )}
        </section>
      </div>

      <div className="mt-8">
        <MuralVagas />
      </div>
    </>
  );
}

/** CTA para conectar o LinkedIn ao perfil privado (+50 XP na primeira vez). */
function LinkedinPrompt() {
  const { connectLinkedin } = useStore();
  const [url, setUrl] = useState("");
  const valid = /linkedin\.com\/in\/[\w-]+/i.test(url);

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (valid) connectLinkedin(url.trim()); }}
      className="mt-auto flex items-start gap-3 rounded-xl border border-pink-100 bg-pink-50 p-4">
      <Linkedin size={20} className="mt-0.5 shrink-0 text-pink-500" />
      <div className="min-w-0 flex-1">
        <label htmlFor="dash-li" className="text-xs font-semibold text-navy-950">Conecte seu LinkedIn</label>
        <p className="mb-2 text-[11px] text-slate-500">Complete seu perfil profissional privado para desbloquear vagas exclusivas.</p>
        <input id="dash-li" type="url" className="input py-1.5 text-xs" placeholder="https://linkedin.com/in/..."
          value={url} onChange={(e) => setUrl(e.target.value)} />
        <button type="submit" disabled={!valid} className="btn-secondary mt-2 px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-50">Ganhar +50 XP</button>
      </div>
    </form>
  );
}

function SkillBar({ name, pct }: { name: string; pct: number }) {
  return (
    <li>
      <div className="mb-1 flex justify-between text-[11px] font-semibold">
        <span className="text-slate-300">{name}</span>
        <span className="text-pink-300">{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-800" role="progressbar" aria-label={`Cobertura de habilidades em ${name}`}
        aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-1.5 rounded-full bg-gradient-to-r from-pink-400 to-pink-500" style={{ width: `${pct}%` }} />
      </div>
    </li>
  );
}

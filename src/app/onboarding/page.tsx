"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, FileUp, GraduationCap, Repeat2, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { AREAS, GOALS, SKILL_TAGS } from "@/lib/mock-data";
import { decideTrack, type DiagnosticAnswers } from "@/lib/engine";
import * as repo from "@/lib/repo";
import { PageHeader } from "@/components/ui";
import type { Area } from "@/lib/types";

const STEPS = ["Seus dados", "Diagnóstico", "Currículo", "Sua trilha"];
const SITUACOES: { v: DiagnosticAnswers["situacao"]; label: string }[] = [
  { v: "universitaria", label: "Sou universitária" },
  { v: "recem_formada", label: "Sou recém-formada" },
  { v: "profissional_outra_area", label: "Trabalho em outra área e quero migrar" },
  { v: "retorno_mercado", label: "Estou retornando ao mercado de trabalho" },
];
const CONHECIMENTO = ["Nunca estudei o tema", "Sei o básico (Selic, CDB...)", "Já estudei/trabalhei um pouco", "Tenho experiência na área"];

function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={`chip border px-3 py-1.5 text-sm transition ${active ? "border-pink-500 bg-pink-500 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-pink-300"}`}>
      {children}
    </button>
  );
}

export default function Onboarding() {
  const router = useRouter();
  const { profile, completeOnboarding, isDemo } = useStore();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [dados, setDados] = useState({ name: "", email: "", password: "", linkedin: "", bio: "" });
  const [diag, setDiag] = useState<DiagnosticAnswers>({ situacao: "universitaria", experienciaAnos: 0, horasSemana: 4, conhecimento: 0, motivacao: "" });
  const [interests, setInterests] = useState<Area[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [goal, setGoal] = useState(GOALS[0]);
  const [cv, setCv] = useState<File | null>(null);

  const result = decideTrack(diag);
  const toggle = <T,>(list: T[], v: T, set: (l: T[]) => void) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  function validate(): string | null {
    if (step === 0) {
      if (dados.name.trim().length < 3) return "Informe seu nome completo.";
      if (!/^\S+@\S+\.\S+$/.test(dados.email)) return "Informe um e-mail válido.";
      if (!isDemo && dados.password.length < 6) return "A senha precisa ter ao menos 6 caracteres.";
    }
    if (step === 1) {
      if (!interests.length) return "Escolha ao menos uma área de interesse.";
      if (diag.motivacao.trim().length < 20) return "Conte um pouco mais sobre sua motivação (mín. 20 caracteres).";
    }
    if (step === 2 && cv && (cv.type !== "application/pdf" || cv.size > 5 * 1024 * 1024)) return "Envie um PDF de até 5 MB.";
    return null;
  }

  function next() {
    const e = validate();
    setError(e);
    if (!e) setStep((s) => s + 1);
  }

  async function finish() {
    setBusy(true);
    setError(null);
    if (!isDemo) {
      const { error } = await repo.signUp(dados.email, dados.password, dados.name);
      if (error) { setError(error); setBusy(false); return; }
    }
    const cvPath = cv ? await repo.uploadCv(cv) : null;
    completeOnboarding({
      ...profile, id: profile.id, name: dados.name.trim(), email: dados.email.trim(), track_type: result.track,
      level: 1, xp: 0, interests, skills, goal, bio: dados.bio, linkedin_url: dados.linkedin, cv_url: cvPath, avatar_url: null,
    }, { diagnostic: { ...diag, commitment: result.commitment } });
    router.push("/jornada");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Etapa 1 · Inscrição e diagnóstico" title="Vamos montar sua jornada"
        subtitle="Leva 3 minutos. Não existe resposta errada: o diagnóstico avalia seu comprometimento e potencial, e não exclui iniciantes." />

      <ol className="mb-6 grid grid-cols-4 gap-2" aria-label="Passos do cadastro">
        {STEPS.map((s, i) => (
          <li key={s} className="text-center">
            <div className={`h-1.5 rounded-full ${i <= step ? "bg-pink-500" : "bg-slate-200"}`} />
            <span className={`mt-2 block text-xs font-medium ${i === step ? "text-pink-600" : "text-slate-500"}`}>{s}</span>
          </li>
        ))}
      </ol>

      <div className="card animate-fade-in p-6 sm:p-8" key={step}>
        {step === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><label className="label" htmlFor="name">Nome completo</label>
              <input id="name" className="input" value={dados.name} onChange={(e) => setDados({ ...dados, name: e.target.value })} autoComplete="name" /></div>
            <div><label className="label" htmlFor="email">E-mail</label>
              <input id="email" type="email" className="input" value={dados.email} onChange={(e) => setDados({ ...dados, email: e.target.value })} autoComplete="email" /></div>
            <div><label className="label" htmlFor="pwd">Senha {isDemo && <span className="text-xs text-slate-400">(opcional no modo demo)</span>}</label>
              <input id="pwd" type="password" className="input" value={dados.password} onChange={(e) => setDados({ ...dados, password: e.target.value })} autoComplete="new-password" /></div>
            <div className="sm:col-span-2"><label className="label" htmlFor="li">LinkedIn (opcional)</label>
              <input id="li" type="url" className="input" placeholder="https://linkedin.com/in/..." value={dados.linkedin} onChange={(e) => setDados({ ...dados, linkedin: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className="label" htmlFor="bio">Minibiografia (opcional)</label>
              <textarea id="bio" rows={2} className="input" value={dados.bio} onChange={(e) => setDados({ ...dados, bio: e.target.value })} /></div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <fieldset>
              <legend className="label">Qual é o seu momento atual?</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {SITUACOES.map((s) => (
                  <label key={s.v} className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm ${diag.situacao === s.v ? "border-pink-500 bg-pink-50" : "border-slate-200"}`}>
                    <input type="radio" name="sit" className="accent-pink-500" checked={diag.situacao === s.v} onChange={() => setDiag({ ...diag, situacao: s.v })} /> {s.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label" htmlFor="exp">Anos de experiência profissional</label>
                <input id="exp" type="number" min={0} max={40} className="input" value={diag.experienciaAnos} onChange={(e) => setDiag({ ...diag, experienciaAnos: +e.target.value })} /></div>
              <div><label className="label" htmlFor="hrs">Horas por semana para estudar: <strong>{diag.horasSemana}h</strong></label>
                <input id="hrs" type="range" min={1} max={15} className="w-full accent-pink-500" value={diag.horasSemana} onChange={(e) => setDiag({ ...diag, horasSemana: +e.target.value })} /></div>
            </div>
            <fieldset>
              <legend className="label">Quanto você conhece do mercado financeiro?</legend>
              <div className="flex flex-wrap gap-2">
                {CONHECIMENTO.map((c, i) => <Toggle key={c} active={diag.conhecimento === i} onClick={() => setDiag({ ...diag, conhecimento: i })}>{c}</Toggle>)}
              </div>
            </fieldset>
            <fieldset>
              <legend className="label">Áreas de interesse</legend>
              <div className="flex flex-wrap gap-2">{AREAS.map((a) => <Toggle key={a} active={interests.includes(a)} onClick={() => toggle(interests, a, setInterests)}>{a}</Toggle>)}</div>
            </fieldset>
            <fieldset>
              <legend className="label">Habilidades que você já tem</legend>
              <div className="flex flex-wrap gap-2">{SKILL_TAGS.map((s) => <Toggle key={s} active={skills.includes(s)} onClick={() => toggle(skills, s, setSkills)}>{s}</Toggle>)}</div>
            </fieldset>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label" htmlFor="goal">Objetivo principal</label>
                <select id="goal" className="input" value={goal} onChange={(e) => setGoal(e.target.value)}>{GOALS.map((g) => <option key={g}>{g}</option>)}</select></div>
            </div>
            <div><label className="label" htmlFor="mot">Por que você quer entrar (ou crescer) no mercado financeiro?</label>
              <textarea id="mot" rows={3} className="input" value={diag.motivacao} onChange={(e) => setDiag({ ...diag, motivacao: e.target.value })} placeholder="Conte com suas palavras..." /></div>
          </div>
        )}

        {step === 2 && (
          <div>
            <label htmlFor="cv" className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 p-10 text-center hover:border-pink-400 hover:bg-pink-50/40">
              <FileUp size={36} className="text-pink-500" />
              <span className="font-semibold">{cv ? cv.name : "Clique para enviar seu currículo (PDF, até 5 MB)"}</span>
              <span className="text-xs text-slate-500">{isDemo ? "No modo demo, guardamos apenas o nome do arquivo." : "Salvo com segurança no Supabase Storage (bucket privado)."}</span>
              <input id="cv" type="file" accept="application/pdf" className="sr-only" onChange={(e) => setCv(e.target.files?.[0] ?? null)} />
            </label>
            <p className="mt-3 text-center text-xs text-slate-500">Ainda não tem currículo? Tudo bem, pule este passo: você vai construir um na Etapa 4.</p>
          </div>
        )}

        {step === 3 && (
          <div className="text-center">
            <div className={`mx-auto grid h-20 w-20 place-items-center rounded-full ${result.track === "A" ? "bg-navy-800" : "bg-pink-500"} text-white`}>
              {result.track === "A" ? <GraduationCap size={38} /> : <Repeat2 size={38} />}
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-pink-600">Sua trilha recomendada</p>
            <h2 className="text-2xl font-extrabold">Trilha {result.track} · {result.track === "A" ? "Universitárias Iniciantes" : "Transição de Carreira"}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">{result.reason}</p>
            <ul className="mx-auto mt-5 max-w-md space-y-2 text-left text-sm">
              {(result.track === "A"
                ? ["Introdução ao mercado e formação técnica básica", "Contato com ligas universitárias", "Currículo e LinkedIn do zero", "Preparação para estágios e programas de férias"]
                : ["Diagnóstico de competências transferíveis", "Formação técnica direcionada", "Mentoria executiva e novo posicionamento", "Vagas de transição"]
              ).map((t) => <li key={t} className="flex gap-2"><CheckCircle2 size={18} className="shrink-0 text-solar-500" /> {t}</li>)}
            </ul>
            <div className="mx-auto mt-6 max-w-xs rounded-xl bg-solar-400/15 p-3 text-sm">
              <Sparkles size={14} className="mr-1 inline text-amber-600" /> Índice de comprometimento: <strong>{result.commitment}/100</strong>
            </div>
          </div>
        )}

        {error && <p role="alert" className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        <div className="mt-8 flex justify-between gap-3">
          <button className="btn-secondary" onClick={() => { setError(null); setStep((s) => s - 1); }} disabled={step === 0} style={{ visibility: step === 0 ? "hidden" : "visible" }}>
            <ArrowLeft size={16} /> Voltar
          </button>
          {step < 3
            ? <button className="btn-primary" onClick={next}>{step === 2 && !cv ? "Pular" : "Continuar"} <ArrowRight size={16} /></button>
            : <button className="btn-primary" onClick={finish} disabled={busy}>{busy ? "Salvando..." : "Começar minha jornada"} <ArrowRight size={16} /></button>}
        </div>
      </div>
    </div>
  );
}

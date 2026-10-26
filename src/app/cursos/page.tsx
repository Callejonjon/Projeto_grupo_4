"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, Check, Clock, ExternalLink, FileText, Link2, Lock, Pencil, PlayCircle, Save, X } from "lucide-react";
import { useStore } from "@/lib/store";
import type { ContentSlot, Module } from "@/lib/types";
import Quiz from "@/components/Quiz";
import { PageHeader } from "@/components/ui";

const CONTENT_KEY = "grupo4-content-overrides";
const STAGE_TITLES: Record<number, string> = { 2: "Etapa 2 · Formação básica", 4: "Etapa 4 · Preparação para processos seletivos", 5: "Etapa 5 · Conclusão" };
const ICONS = { video: PlayCircle, texto: FileText, link: Link2 };

/** Conteúdo editável: a gestora cola os próprios vídeos/links (persistido no navegador; troque por tabela no Supabase). */
function useContentOverrides() {
  const [ov, setOv] = useState<Record<string, ContentSlot[]>>({});
  useEffect(() => { try { setOv(JSON.parse(localStorage.getItem(CONTENT_KEY) ?? "{}")); } catch { /* noop */ } }, []);
  const save = (id: string, slots: ContentSlot[]) => {
    const next = { ...ov, [id]: slots };
    setOv(next);
    localStorage.setItem(CONTENT_KEY, JSON.stringify(next));
  };
  return { ov, save };
}

const isPlaceholder = (url: string) => url.startsWith("#") || url.includes("SEU_VIDEO_AQUI");

function ModuleDetail({ module, slots, onSave, onClose }: { module: Module; slots: ContentSlot[]; onSave: (s: ContentSlot[]) => void; onClose: () => void }) {
  const { journey } = useStore();
  const [mode, setMode] = useState<"content" | "quiz" | "edit">("content");
  const [draft, setDraft] = useState(slots);
  const passed = journey.passed.has(module.id);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="mod-title" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-2xl animate-fade-in overflow-y-auto rounded-t-3xl bg-white p-6 sm:rounded-3xl sm:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-pink-600">{STAGE_TITLES[module.stage]}</p>
            <h2 id="mod-title" className="mt-1 text-xl font-extrabold">{module.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{module.description}</p>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X size={20} /></button>
        </div>

        {mode === "quiz" ? <Quiz module={module} onClose={() => setMode("content")} /> : mode === "edit" ? (
          <div className="space-y-4">
            <p className="rounded-xl bg-solar-400/15 p-3 text-xs text-slate-700">Cole aqui seus links. Para vídeos do YouTube, use o formato <code>https://www.youtube.com/embed/ID</code>.</p>
            {draft.map((s, k) => (
              <div key={k} className="grid gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-[110px_1fr]">
                <select className="input" value={s.type} onChange={(e) => setDraft(draft.map((d, j) => j === k ? { ...d, type: e.target.value as ContentSlot["type"] } : d))}>
                  <option value="video">Vídeo</option><option value="texto">Texto/PDF</option><option value="link">Link</option>
                </select>
                <input className="input" aria-label="Título" value={s.title} onChange={(e) => setDraft(draft.map((d, j) => j === k ? { ...d, title: e.target.value } : d))} />
                <input className="input sm:col-span-2" aria-label="URL" value={s.url} onChange={(e) => setDraft(draft.map((d, j) => j === k ? { ...d, url: e.target.value } : d))} />
              </div>
            ))}
            <div className="flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => { setDraft(slots); setMode("content"); }}>Cancelar</button>
              <button className="btn-primary" onClick={() => { onSave(draft); setMode("content"); }}><Save size={16} /> Salvar conteúdo</button>
            </div>
          </div>
        ) : (
          <>
            <ul className="space-y-3">
              {slots.map((s, k) => {
                const Icon = ICONS[s.type];
                if (s.type === "video" && !isPlaceholder(s.url)) {
                  return <li key={k}><iframe src={s.url} title={s.title} className="aspect-video w-full rounded-xl" allowFullScreen /></li>;
                }
                return (
                  <li key={k}>
                    <a href={isPlaceholder(s.url) ? undefined : s.url} target="_blank" rel="noreferrer"
                      className={`flex items-center gap-3 rounded-xl border p-4 ${isPlaceholder(s.url) ? "border-dashed border-slate-300 bg-slate-50" : "border-slate-200 hover:border-pink-300"}`}>
                      <Icon size={22} className="shrink-0 text-pink-500" />
                      <span className="flex-1 text-sm font-medium">{s.title}{module.partner && s.type === "link" ? ` (${module.partner})` : ""}</span>
                      {isPlaceholder(s.url) ? <span className="chip bg-slate-200 text-slate-600">espaço reservado</span> : <ExternalLink size={16} className="text-slate-400" />}
                    </a>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
              <button className="btn-secondary" onClick={() => setMode("edit")}><Pencil size={16} /> Editar conteúdo</button>
              <button className="btn-primary" onClick={() => setMode("quiz")}>
                {passed ? "Refazer quiz" : `Fazer quiz (${module.quiz.length} perguntas)`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CursosInner() {
  const { modules, journey, progress } = useStore();
  const params = useSearchParams();
  const router = useRouter();
  const { ov, save } = useContentOverrides();
  const selectedId = params.get("m");
  const selected = modules.find((m) => m.id === selectedId && journey.unlocked.has(m.id));

  const open = (id: string) => router.push(`/cursos?m=${id}`, { scroll: false });
  const close = () => router.push("/cursos", { scroll: false });

  return (
    <>
      <PageHeader eyebrow="Cursos e Quizzes" title="Formação na prática"
        subtitle="Assista, leia e prove o que aprendeu: com 70% no quiz, você ganha XP e destrava o próximo módulo. Parceiros: IBooster e Modu." />

      {[2, 4, 5].map((stage) => (
        <section key={stage} className="mb-10">
          <h2 className="mb-4 text-lg font-bold">{STAGE_TITLES[stage]}</h2>
          {stage === 4 && !journey.stagesDone[3] && (
            <p className="mb-4 rounded-xl bg-pink-50 p-3 text-sm text-pink-700"><Lock size={14} className="mr-1 inline" /> Conclua a formação básica e conecte-se a uma mentora (Etapa 3) para liberar esta etapa.</p>
          )}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {modules.filter((m) => m.stage === stage).map((m) => {
              const passed = journey.passed.has(m.id);
              const unlocked = journey.unlocked.has(m.id);
              const score = progress.find((p) => p.module_id === m.id)?.quiz_score;
              return (
                <article key={m.id} className={`card flex flex-col p-5 transition ${unlocked ? "hover:-translate-y-0.5 hover:shadow-md" : "opacity-60"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <span className={`grid h-11 w-11 place-items-center rounded-xl ${passed ? "bg-solar-400 text-navy-950" : unlocked ? "bg-pink-100 text-pink-600" : "bg-slate-100 text-slate-400"}`}>
                      {passed ? <Check size={20} /> : unlocked ? <BookOpen size={20} /> : <Lock size={18} />}
                    </span>
                    <div className="flex flex-wrap justify-end gap-1">
                      {m.track !== "all" && <span className="chip bg-navy-800/10 text-navy-800">Trilha {m.track}</span>}
                      {m.partner && <span className="chip bg-slate-100 text-slate-600">{m.partner}</span>}
                    </div>
                  </div>
                  <h3 className="mt-4 font-bold">{m.title}</h3>
                  <p className="mt-1 flex-1 text-sm text-slate-600">{m.description}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Clock size={14} /> {m.durationMin} min</span>
                    {score !== undefined && <span className={score >= 70 ? "font-semibold text-amber-600" : "text-pink-600"}>Melhor nota: {score}%</span>}
                  </div>
                  <button className={unlocked ? "btn-primary mt-4" : "btn-secondary mt-4"} disabled={!unlocked} onClick={() => open(m.id)}>
                    {passed ? "Revisar" : unlocked ? "Começar" : "Bloqueado"}
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      ))}

      {selected && (
        <ModuleDetail key={selected.id} module={selected} slots={ov[selected.id] ?? selected.content} onSave={(s) => save(selected.id, s)} onClose={close} />
      )}
    </>
  );
}

export default function Cursos() {
  return <Suspense><CursosInner /></Suspense>;
}

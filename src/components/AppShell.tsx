"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3, Briefcase, GraduationCap, LayoutDashboard, Map, Menu, ShieldCheck, Sparkles, Star, User, Users, X,
} from "lucide-react";
import { useStore, type ViewMode } from "@/lib/store";
import { LEVEL_NAMES, levelProgress } from "@/lib/engine";
import Chatbot from "./Chatbot";
import CelebrationOverlay from "./CelebrationOverlay";

const STUDENT_NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jornada", label: "Minha Jornada", icon: Map },
  { href: "/cursos", label: "Cursos e Quizzes", icon: GraduationCap },
  { href: "/mentoria", label: "Mentoria e Networking", icon: Users },
  { href: "/vagas", label: "Mural de Vagas", icon: Briefcase },
  { href: "/perfil", label: "Meu Perfil", icon: User },
];
const ADMIN_NAV = [
  { href: "/admin", label: "Painel de Impacto", icon: BarChart3 },
  { href: "/vagas", label: "Curadoria de Vagas", icon: Briefcase },
  { href: "/mentoria", label: "Mentoras e Eventos", icon: Users },
];

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-pink-500 text-white shadow-lg shadow-pink-500/30">4</span>
      <span className={light ? "text-white" : "text-navy-950"}>Grupo <span className="text-pink-500">4</span></span>
    </span>
  );
}

function ViewToggle() {
  const { view, setView } = useStore();
  const router = useRouter();
  const go = (v: ViewMode) => { setView(v); router.push(v === "admin" ? "/admin" : "/"); };
  return (
    <div role="radiogroup" aria-label="Alternar visão" className="grid grid-cols-2 rounded-xl bg-white/10 p-1 text-xs font-semibold">
      {(["aluna", "admin"] as const).map((v) => (
        <button key={v} role="radio" aria-checked={view === v} onClick={() => go(v)}
          className={`rounded-lg px-2 py-2 transition ${view === v ? "bg-white text-navy-950 shadow" : "text-white/70 hover:text-white"}`}>
          {v === "aluna" ? "Visão da Aluna" : "Painel Admin"}
        </button>
      ))}
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { view, profile, isDemo } = useStore();
  const nav = view === "admin" ? ADMIN_NAV : STUDENT_NAV;
  const lp = levelProgress(profile.xp);

  return (
    <div className="flex h-full flex-col gap-6 p-5">
      <Brand light />
      <ViewToggle />

      <nav aria-label="Principal" className="flex flex-col gap-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link key={href} href={href} onClick={onNavigate} aria-current={active ? "page" : undefined}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active ? "bg-pink-500 text-white shadow-lg shadow-pink-500/25" : "text-white/75 hover:bg-white/10 hover:text-white"}`}>
              <Icon size={18} aria-hidden /> {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3">
        {view === "aluna" ? (
          <Link href="/perfil" onClick={onNavigate} className="block rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 hover:bg-white/10">
            <div className="flex items-center justify-between text-xs text-white/70">
              <span className="flex items-center gap-1"><Star size={14} className="fill-solar-400 text-solar-400" /> Nível {lp.level}</span>
              <span>{profile.xp} XP</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-white">{LEVEL_NAMES[lp.level - 1]}</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={lp.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso de nível">
              <div className="h-full rounded-full bg-gradient-to-r from-solar-500 to-solar-400 transition-all" style={{ width: `${lp.pct}%` }} />
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-2 rounded-2xl bg-white/5 p-4 text-xs text-white/80 ring-1 ring-white/10">
            <ShieldCheck size={16} className="text-solar-400" /> Área restrita: gestão e banca avaliadora
          </div>
        )}
        {isDemo && (
          <p className="flex items-center gap-1.5 text-[11px] text-white/50"><Sparkles size={12} /> Modo demonstração (mock data)</p>
        )}
      </div>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { view } = useStore();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="min-h-screen lg:pl-72">
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        Pular para o conteúdo
      </a>

      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 bg-gradient-to-b from-navy-950 via-navy-950 to-navy-800 lg:block">
        <SidebarContent />
      </aside>

      {/* Topbar mobile */}
      <header className="sticky top-0 z-30 flex items-center justify-between bg-navy-950 px-4 py-3 lg:hidden">
        <Brand light />
        <button onClick={() => setOpen(true)} aria-label="Abrir menu" className="rounded-lg p-2 text-white hover:bg-white/10"><Menu /></button>
      </header>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-navy-950/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 animate-fade-in bg-gradient-to-b from-navy-950 to-navy-800">
            <button onClick={() => setOpen(false)} aria-label="Fechar menu" className="absolute right-3 top-4 rounded-lg p-2 text-white hover:bg-white/10"><X size={20} /></button>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <main id="conteudo" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>

      {view === "aluna" && <Chatbot />}
      <CelebrationOverlay />
    </div>
  );
}

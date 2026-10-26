"use client";
import { useState } from "react";
import { Minus, Newspaper, Pause, Play, TrendingDown, TrendingUp } from "lucide-react";
import { MARKET_NEWS, MARKET_PILLS } from "@/lib/mock-data";

/** Banner horizontal discreto (sem pop-up). Clique numa pílula para ver a explicação didática. */
export default function MarketTicker() {
  const [paused, setPaused] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const items = [...MARKET_PILLS, ...MARKET_PILLS]; // duplicado p/ loop contínuo

  return (
    <section aria-label="Giro de Mercado" className="card mb-6 overflow-hidden">
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-2">
        <span className="flex shrink-0 items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-navy-800">
          <Newspaper size={14} className="text-pink-500" /> Giro de Mercado
        </span>
        <p className="min-w-0 flex-1 truncate text-xs text-slate-500">{MARKET_NEWS[new Date().getDate() % MARKET_NEWS.length]}</p>
        <button onClick={() => setPaused((p) => !p)} className="rounded p-1 text-slate-400 hover:text-navy-800" aria-label={paused ? "Retomar rolagem" : "Pausar rolagem"}>
          {paused ? <Play size={14} /> : <Pause size={14} />}
        </button>
      </div>

      <div className="relative overflow-hidden py-2.5" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <ul className="flex w-max animate-marquee gap-3 px-3" style={{ animationPlayState: paused ? "paused" : "running" }}>
          {items.map((p, i) => {
            const Icon = p.trend === "up" ? TrendingUp : p.trend === "down" ? TrendingDown : Minus;
            const tone = p.trend === "up" ? "text-emerald-600" : p.trend === "down" ? "text-rose-500" : "text-slate-400";
            return (
              <li key={i} aria-hidden={i >= MARKET_PILLS.length}>
                <button onClick={() => setSelected(i % MARKET_PILLS.length)} tabIndex={i >= MARKET_PILLS.length ? -1 : 0}
                  className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-sm ring-1 ring-slate-200 hover:ring-pink-300">
                  <span className="font-semibold text-navy-950">{p.label}</span>
                  <span className="text-slate-600">{p.value}</span>
                  <Icon size={14} className={tone} />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {selected !== null && (
        <div className="flex items-start justify-between gap-3 border-t border-slate-100 bg-solar-400/10 px-4 py-2.5 text-sm text-slate-700" aria-live="polite">
          <p><strong className="text-navy-950">{MARKET_PILLS[selected].label} em português claro:</strong> {MARKET_PILLS[selected].explain}</p>
          <button onClick={() => setSelected(null)} className="text-xs font-semibold text-pink-600 hover:underline">fechar</button>
        </div>
      )}
      <p className="px-4 pb-2 text-[10px] text-slate-400">Valores ilustrativos no modo demo · conecte uma API de cotações para dados reais.</p>
    </section>
  );
}

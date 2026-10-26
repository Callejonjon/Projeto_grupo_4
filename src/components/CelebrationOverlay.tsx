"use client";
import { useEffect, useMemo } from "react";
import { Star, Trophy } from "lucide-react";
import { useStore } from "@/lib/store";

const COLORS = ["#EC4899", "#F59E0B", "#FBBF24", "#1E3A8A", "#DB2777"];

/** Animação de conquista: confete em CSS puro (sem dependências), acessível e dispensável. */
export default function CelebrationOverlay() {
  const { celebration, dismissCelebration } = useStore();

  const pieces = useMemo(() => Array.from({ length: 36 }, (_, i) => ({
    left: `${(i * 37) % 100}%`, delay: `${(i % 9) * 0.08}s`, color: COLORS[i % COLORS.length],
    rot: `${(i % 2 ? 1 : -1) * (180 + i * 20)}deg`, size: 6 + (i % 4) * 3,
  })), []);

  useEffect(() => {
    if (!celebration) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && dismissCelebration();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [celebration, dismissCelebration]);

  if (!celebration) return null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-navy-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="celebration-title" onClick={dismissCelebration}>
      <div className="pointer-events-none absolute inset-x-0 bottom-1/3 h-0" aria-hidden>
        {pieces.map((p, i) => (
          <span key={i} className="absolute animate-float-up rounded-sm"
            style={{ left: p.left, animationDelay: p.delay, background: p.color, width: p.size, height: p.size * 1.6, ["--r" as string]: p.rot }} />
        ))}
      </div>

      <div className="relative w-full max-w-sm animate-pop rounded-3xl bg-white p-8 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-solar-400 to-solar-500 shadow-lg shadow-solar-500/40">
          {celebration.levelUp ? <Star size={40} className="fill-white text-white" /> : <Trophy size={38} className="text-white" />}
        </div>
        <h2 id="celebration-title" className="mt-5 text-2xl font-extrabold text-navy-950">{celebration.title}</h2>
        <p className="mt-2 text-sm text-slate-600">{celebration.subtitle}</p>
        {celebration.xp > 0 && (
          <p className="mt-4 inline-flex items-center gap-1 rounded-full bg-solar-400/20 px-3 py-1 text-sm font-bold text-amber-700">+{celebration.xp} XP</p>
        )}
        {celebration.levelUp && (
          <div className="mt-3 flex justify-center gap-1" aria-label={`Nível ${celebration.levelUp} de 5`}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} size={22} className={n <= celebration.levelUp! ? "fill-solar-400 text-solar-400" : "text-slate-300"} />
            ))}
          </div>
        )}
        <button className="btn-primary mt-6 w-full" onClick={dismissCelebration} autoFocus>Continuar jornada</button>
      </div>
    </div>
  );
}

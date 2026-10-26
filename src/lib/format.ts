/** Formatação determinística (mesmo resultado no servidor e no navegador → sem hydration mismatch). */
const TZ = "America/Sao_Paulo";

export const fmtDay = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", timeZone: TZ });
export const fmtMonth = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { month: "short", timeZone: TZ }).replace(".", "");
export const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
export const fmtDayMonth = (iso: string) => `${fmtDay(iso)} ${fmtMonth(iso)}`;

export function timeAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "hoje";
  if (days === 1) return "ontem";
  return `há ${days} dias`;
}

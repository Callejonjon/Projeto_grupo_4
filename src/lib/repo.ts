"use client";
import { isDemoMode, supabase } from "./supabase";
import type { Job, Profile } from "./types";

/**
 * Camada de persistência. Em MODO DEMO tudo é no-op (o estado vive no localStorage).
 * Com Supabase configurado, grava nas tabelas do supabase_schema.sql.
 * Erros são logados, mas nunca quebram a UI (fire-and-forget otimista).
 */
async function uid() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

const log = (where: string, error: unknown) => error && console.warn(`[supabase:${where}]`, error);

export async function signUp(email: string, password: string, name: string) {
  if (!supabase) return { error: null };
  const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
  return { error: error?.message ?? null };
}

export async function saveProfile(p: Profile, extra?: Record<string, unknown>) {
  const id = await uid();
  if (!supabase || !id) return;
  const { error } = await supabase.from("profiles").update({
    name: p.name, track_type: p.track_type, level: p.level, xp: p.xp, interests: p.interests,
    skills: p.skills, bio: p.bio, linkedin_url: p.linkedin_url, cv_url: p.cv_url, ...extra,
  }).eq("id", id);
  log("profiles", error);
}

export async function uploadCv(file: File): Promise<string> {
  const id = await uid();
  if (isDemoMode || !supabase || !id) return file.name; // demo: guarda só o nome
  const path = `${id}/curriculo-${Date.now()}.pdf`;
  const { error } = await supabase.storage.from("curriculos").upload(path, file, { contentType: "application/pdf", upsert: true });
  log("storage", error);
  return error ? file.name : path;
}

export async function saveModuleProgress(moduleId: string, score: number, passed: boolean) {
  const id = await uid();
  if (!supabase || !id) return;
  const { error } = await supabase.from("modules_progress").upsert(
    { user_id: id, module_id: moduleId, quiz_score: score, completed_at: passed ? new Date().toISOString() : null },
    { onConflict: "user_id,module_id" });
  log("modules_progress", error);
}

export async function saveMentorRequest(mentorId: string, affinity: number) {
  const id = await uid();
  if (!supabase || !id) return;
  const { error } = await supabase.from("mentorship_matches").upsert(
    { user_id: id, mentor_id: mentorId, affinity }, { onConflict: "user_id,mentor_id" });
  log("mentorship_matches", error);
}

export async function saveApplication(jobId: string, matchPct: number) {
  const id = await uid();
  if (!supabase || !id) return;
  const { error } = await supabase.from("applications").upsert(
    { user_id: id, job_id: jobId, match_pct: matchPct }, { onConflict: "user_id,job_id" });
  log("applications", error);
}

export async function insertJob(job: Job) {
  if (!supabase) return;
  const { id: _omit, ...row } = job;
  const { error } = await supabase.from("jobs").insert({ ...row, source_url: row.source_url === "#" ? null : row.source_url });
  log("jobs", error);
}

export async function fetchJobs(): Promise<Job[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from("jobs").select("*").order("created_at", { ascending: false }).limit(200);
  log("jobs", error);
  return (data as Job[] | null) ?? null;
}

-- =====================================================================
-- Grupo 4 | Supabase schema (PostgreSQL)
-- Cole no SQL Editor do Supabase e execute. Idempotente onde possível.
-- Tabelas pedidas: profiles, modules_progress, mentorships, jobs
-- Tabelas de apoio (KPIs do Painel de Impacto): mentorship_matches, applications,
-- career_outcomes, events
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------- PROFILES (1:1 com auth.users) ----------
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  name          text not null,
  email         text not null unique,
  track_type    text check (track_type in ('A','B')),          -- A = Universitárias | B = Transição
  level         int  not null default 1 check (level between 1 and 5),
  xp            int  not null default 0 check (xp >= 0),
  interests     text[] not null default '{}',                  -- ex.: {'Asset Management','Crédito'}
  skills        text[] not null default '{}',                  -- ex.: {'Excel','Python'}
  bio           text,
  avatar_url    text,
  linkedin_url  text,
  cv_url        text,                                          -- caminho no bucket 'curriculos'
  diagnostic    jsonb,                                         -- respostas do questionário inicial
  is_admin      boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ---------- PROGRESSO NOS MÓDULOS / QUIZZES ----------
create table if not exists public.modules_progress (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  module_id     text not null,                                 -- id do módulo no catálogo (ex.: 'm2-mercado')
  quiz_score    numeric(5,2) check (quiz_score between 0 and 100),
  completed_at  timestamptz,
  unique (user_id, module_id)
);

-- ---------- MENTORAS ----------
create table if not exists public.mentorships (
  id            uuid primary key default gen_random_uuid(),
  mentor_name   text not null,
  mentor_role   text not null,                                 -- ex.: 'Diretora de Crédito - Banco X'
  specialty     text not null,                                 -- área principal
  bio           text,
  match_tags    text[] not null default '{}',                  -- áreas, competências, trilhas ('A','B'), objetivos
  capacity      int not null default 3,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ---------- PAREAMENTOS REALIZADOS ----------
create table if not exists public.mentorship_matches (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  mentor_id     uuid not null references public.mentorships(id) on delete cascade,
  affinity      numeric(5,2) not null,
  status        text not null default 'solicitado' check (status in ('solicitado','ativo','concluido','cancelado')),
  sessions_done int not null default 0,
  created_at    timestamptz not null default now(),
  unique (user_id, mentor_id)
);

-- ---------- VAGAS (RSS/APIs + curadoria manual) ----------
create table if not exists public.jobs (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  company        text not null,
  area           text not null,                                -- 'Crédito','Asset Management','Investment Banking','Research','Tech & Dados'
  modality       text not null check (modality in ('Remoto','Híbrido','Presencial')),
  level_required text not null,                                -- 'Estágio','Júnior','Pleno','Transição'
  skills_tags    text[] not null default '{}',
  description    text,
  location       text,
  source         text not null default 'manual',               -- 'manual' | 'remotive' | 'rss:<feed>'
  source_url     text unique,                                  -- chave de deduplicação da sincronização
  is_exclusive   boolean not null default false,               -- vaga de empresa parceira
  created_at     timestamptz not null default now()
);
create index if not exists jobs_area_idx on public.jobs(area);
create index if not exists jobs_created_idx on public.jobs(created_at desc);

-- ---------- CANDIDATURAS E DESFECHOS (funil de empregabilidade) ----------
create table if not exists public.applications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  job_id      uuid not null references public.jobs(id) on delete cascade,
  match_pct   int,
  status      text not null default 'enviada' check (status in ('enviada','entrevista','aprovada','reprovada')),
  created_at  timestamptz not null default now(),
  unique (user_id, job_id)
);

create table if not exists public.career_outcomes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text not null check (type in ('contratacao','promocao','estagio')),
  company     text,
  role        text,
  reported_at timestamptz not null default now()
);

-- ---------- EVENTOS / COMUNIDADE ----------
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  host        text not null,
  kind        text not null check (kind in ('Networking','Bate-papo','Liga Universitária','Empresa Parceira')),
  starts_at   timestamptz not null,
  location    text,
  url         text,
  tracks      text[] not null default '{A,B}'
);

-- =====================================================================
-- Perfil criado automaticamente no signup (Supabase Auth)
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), new.email)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: usuária atual é admin?
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.profiles           enable row level security;
alter table public.modules_progress   enable row level security;
alter table public.mentorships        enable row level security;
alter table public.mentorship_matches enable row level security;
alter table public.jobs               enable row level security;
alter table public.applications       enable row level security;
alter table public.career_outcomes    enable row level security;
alter table public.events             enable row level security;

-- Cada aluna vê/edita só o próprio perfil; admin vê todos (KPIs)
create policy "profiles_self_select" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles_self_update" on public.profiles for update using (id = auth.uid())
  with check (id = auth.uid() and is_admin = public.is_admin());   -- impede auto-promoção a admin

-- Dados pessoais de jornada: dona ou admin
create policy "progress_owner" on public.modules_progress for all
  using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid());
create policy "matches_owner" on public.mentorship_matches for all
  using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid());
create policy "applications_owner" on public.applications for all
  using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid());
create policy "outcomes_owner" on public.career_outcomes for all
  using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid());

-- Catálogos: leitura para autenticadas, escrita só admin
create policy "mentors_read"  on public.mentorships for select using (auth.role() = 'authenticated');
create policy "mentors_admin" on public.mentorships for all using (public.is_admin()) with check (public.is_admin());
create policy "jobs_read"     on public.jobs for select using (auth.role() = 'authenticated');
create policy "jobs_admin"    on public.jobs for all using (public.is_admin()) with check (public.is_admin());
create policy "events_read"   on public.events for select using (auth.role() = 'authenticated');
create policy "events_admin"  on public.events for all using (public.is_admin()) with check (public.is_admin());
-- Obs.: a rota /api/jobs/sync usa a SERVICE_ROLE_KEY (ignora RLS) no servidor.

-- =====================================================================
-- Storage: currículos em PDF (bucket privado, pasta = id da usuária)
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('curriculos', 'curriculos', false, 5242880, array['application/pdf'])
on conflict (id) do nothing;

create policy "cv_owner_rw" on storage.objects for all
  using (bucket_id = 'curriculos' and (auth.uid()::text = (storage.foldername(name))[1] or public.is_admin()))
  with check (bucket_id = 'curriculos' and auth.uid()::text = (storage.foldername(name))[1]);

-- =====================================================================
-- View de KPIs para o Painel de Impacto (consumida pelo admin)
-- =====================================================================
create or replace view public.vw_impact_kpis with (security_invoker = true) as
select
  (select count(*) from public.profiles where track_type = 'A')                      as inscritas_trilha_a,
  (select count(*) from public.profiles where track_type = 'B')                      as inscritas_trilha_b,
  (select round(avg(quiz_score), 1) from public.modules_progress where quiz_score is not null) as nota_media_quizzes,
  (select count(*) from public.mentorship_matches)                                   as pareamentos,
  (select count(*) from public.mentorship_matches where status in ('ativo','concluido')) as mentorias_ativas,
  (select count(*) from public.applications)                                         as candidaturas,
  (select count(*) from public.career_outcomes)                                      as contratacoes_promocoes;

-- =====================================================================
-- Seeds mínimos (opcional) — mentoras de exemplo
-- =====================================================================
insert into public.mentorships (mentor_name, mentor_role, specialty, bio, match_tags) values
 ('Carla Menezes',  'Head de Crédito Corporativo', 'Crédito',            'Mais de 15 anos estruturando operações de crédito.', '{Crédito,Excel,Análise de Balanço,B,Liderança}'),
 ('Juliana Prado',  'Portfolio Manager',           'Asset Management',   'Gestora de fundos multimercado, CFA.',               '{Asset Management,Python,CPA-20,A,Investimentos}'),
 ('Renata Okada',   'VP de Investment Banking',    'Investment Banking', 'M&A e ECM, mentora de ligas universitárias.',        '{Investment Banking,Valuation,Excel,A,Estágio}'),
 ('Fernanda Lima',  'Head de Dados',               'Tech & Dados',       'Lidera times de dados em fintech.',                  '{Tech & Dados,Python,SQL,Power BI,B,Transição}')
on conflict do nothing;

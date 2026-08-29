-- Rotinas diárias: lista fixa de tarefas recorrentes (não passam pelo fluxo
-- A Fazer / Fazendo / Concluído) que só precisam ser marcadas como feitas
-- no dia e voltam desmarcadas automaticamente no dia seguinte.
create table if not exists public.daily_routines (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  assigned_to uuid references public.profiles(id) on delete set null,
  position int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Um registro por rotina concluída em um dia específico. O "reset diário" é
-- natural: a UI só considera uma rotina concluída se existir uma linha aqui
-- com completion_date = hoje.
create table if not exists public.daily_routine_completions (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid references public.daily_routines(id) on delete cascade not null,
  completion_date date not null,
  completed_by uuid references public.profiles(id) on delete set null,
  completed_at timestamptz not null default now(),
  unique (routine_id, completion_date)
);

create index if not exists daily_routines_position_idx on public.daily_routines(position);
create index if not exists daily_routine_completions_routine_id_idx
  on public.daily_routine_completions(routine_id);
create index if not exists daily_routine_completions_completion_date_idx
  on public.daily_routine_completions(completion_date);

alter table public.daily_routines enable row level security;
alter table public.daily_routine_completions enable row level security;

drop policy if exists "daily_routines: select for authenticated" on public.daily_routines;
create policy "daily_routines: select for authenticated" on public.daily_routines
  for select to authenticated using (true);

drop policy if exists "daily_routines: insert for authenticated" on public.daily_routines;
create policy "daily_routines: insert for authenticated" on public.daily_routines
  for insert to authenticated with check (true);

drop policy if exists "daily_routines: update for authenticated" on public.daily_routines;
create policy "daily_routines: update for authenticated" on public.daily_routines
  for update to authenticated using (true);

drop policy if exists "daily_routines: delete for authenticated" on public.daily_routines;
create policy "daily_routines: delete for authenticated" on public.daily_routines
  for delete to authenticated using (true);

drop policy if exists "daily_routine_completions: select for authenticated" on public.daily_routine_completions;
create policy "daily_routine_completions: select for authenticated" on public.daily_routine_completions
  for select to authenticated using (true);

drop policy if exists "daily_routine_completions: insert for authenticated" on public.daily_routine_completions;
create policy "daily_routine_completions: insert for authenticated" on public.daily_routine_completions
  for insert to authenticated with check (true);

drop policy if exists "daily_routine_completions: update for authenticated" on public.daily_routine_completions;
create policy "daily_routine_completions: update for authenticated" on public.daily_routine_completions
  for update to authenticated using (true);

drop policy if exists "daily_routine_completions: delete for authenticated" on public.daily_routine_completions;
create policy "daily_routine_completions: delete for authenticated" on public.daily_routine_completions
  for delete to authenticated using (true);

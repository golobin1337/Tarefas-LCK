-- Prioridade da tarefa, usada no painel de detalhe e na barra lateral do card.
alter table public.tasks
  add column if not exists priority text not null default 'media';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.tasks'::regclass
      and conname = 'tasks_priority_check'
  ) then
    alter table public.tasks
      add constraint tasks_priority_check check (priority in ('baixa', 'media', 'alta'));
  end if;
end $$;

-- Checklist (subtarefas) de cada tarefa.
create table if not exists public.task_checklist_items (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks(id) on delete cascade not null,
  title text not null,
  is_done boolean not null default false,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists task_checklist_items_task_id_idx
  on public.task_checklist_items(task_id);

alter table public.task_checklist_items enable row level security;

drop policy if exists "task_checklist_items: select for authenticated" on public.task_checklist_items;
create policy "task_checklist_items: select for authenticated" on public.task_checklist_items
  for select to authenticated using (true);

drop policy if exists "task_checklist_items: insert for authenticated" on public.task_checklist_items;
create policy "task_checklist_items: insert for authenticated" on public.task_checklist_items
  for insert to authenticated with check (true);

drop policy if exists "task_checklist_items: update for authenticated" on public.task_checklist_items;
create policy "task_checklist_items: update for authenticated" on public.task_checklist_items
  for update to authenticated using (true);

drop policy if exists "task_checklist_items: delete for authenticated" on public.task_checklist_items;
create policy "task_checklist_items: delete for authenticated" on public.task_checklist_items
  for delete to authenticated using (true);

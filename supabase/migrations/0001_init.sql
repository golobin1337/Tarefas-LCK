-- Extensão necessária para gen_random_uuid()
create extension if not exists "pgcrypto";

-- Perfis (espelha auth.users)
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  created_at timestamptz not null default now()
);

-- Projetos/categorias simples (ex: "Mundo Conhecimento", "Financeiro", "Pessoal")
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null default '#6366f1',
  created_at timestamptz not null default now()
);

-- Tarefas
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'done')),
  is_urgent boolean not null default false,
  due_date date,
  project_id uuid references projects(id) on delete set null,
  assigned_to uuid references profiles(id) on delete set null,
  created_by uuid references profiles(id) not null,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists tasks_due_date_idx on tasks(due_date);
create index if not exists tasks_status_idx on tasks(status);
create index if not exists tasks_is_urgent_idx on tasks(is_urgent);
create index if not exists tasks_project_id_idx on tasks(project_id);
create index if not exists tasks_assigned_to_idx on tasks(assigned_to);

-- Cria automaticamente um perfil quando um usuário é criado no Supabase Auth.
-- Assim, basta criar o usuário manualmente em Authentication > Users que o
-- perfil (usado para atribuir tarefas) aparece sozinho.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Row Level Security
alter table profiles enable row level security;
alter table projects enable row level security;
alter table tasks enable row level security;

-- profiles: qualquer usuário autenticado pode ver todos os perfis (só existem 2),
-- mas só pode alterar o próprio.
create policy "profiles: select for authenticated" on profiles
  for select to authenticated using (true);

create policy "profiles: update own" on profiles
  for update to authenticated using (auth.uid() = id);

-- projects: qualquer usuário autenticado pode ler e escrever.
create policy "projects: select for authenticated" on projects
  for select to authenticated using (true);

create policy "projects: insert for authenticated" on projects
  for insert to authenticated with check (true);

create policy "projects: update for authenticated" on projects
  for update to authenticated using (true);

create policy "projects: delete for authenticated" on projects
  for delete to authenticated using (true);

-- tasks: qualquer usuário autenticado pode ler e escrever.
create policy "tasks: select for authenticated" on tasks
  for select to authenticated using (true);

create policy "tasks: insert for authenticated" on tasks
  for insert to authenticated with check (true);

create policy "tasks: update for authenticated" on tasks
  for update to authenticated using (true);

create policy "tasks: delete for authenticated" on tasks
  for delete to authenticated using (true);

-- Projetos iniciais de exemplo (opcional, pode apagar/editar depois pela UI)
insert into projects (name, color) values
  ('Mundo Conhecimento', '#6366f1'),
  ('Financeiro', '#22c55e'),
  ('Pessoal', '#f59e0b')
on conflict do nothing;

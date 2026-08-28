-- Adiciona o status intermediário 'doing' (Fazendo) para o quadro Kanban.
-- Remove dinamicamente qualquer check constraint existente sobre a coluna
-- status (o nome exato pode variar dependendo de como foi criada) e recria
-- com os 3 valores aceitos.
do $$
declare
  con record;
begin
  for con in
    select conname
    from pg_constraint
    where conrelid = 'public.tasks'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%status%'
  loop
    execute format('alter table public.tasks drop constraint %I', con.conname);
  end loop;
end $$;

alter table public.tasks
  add constraint tasks_status_check check (status in ('todo', 'doing', 'done'));

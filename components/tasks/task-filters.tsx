"use client";

import { Search } from "lucide-react";
import type { Profile, Project } from "@/lib/types";

export type TaskFilterValues = {
  search: string;
  assignee: string;
  project: string;
};

type TaskFiltersProps = {
  profiles: Profile[];
  projects: Project[];
  values: TaskFilterValues;
  onChange: (values: TaskFilterValues) => void;
  currentUserId?: string;
};

export function TaskFilters({
  profiles,
  projects,
  values,
  onChange,
  currentUserId,
}: TaskFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 px-4 pb-2 pt-4 sm:px-6">
      <div className="relative flex-1 min-w-[160px]">
        <Search
          size={14}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)]"
        />
        <input
          value={values.search}
          onChange={(e) => onChange({ ...values, search: e.target.value })}
          placeholder="Buscar tarefas..."
          className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg-elevated)] py-1.5 pl-8 pr-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
        />
      </div>

      <select
        value={values.assignee}
        onChange={(e) => onChange({ ...values, assignee: e.target.value })}
        className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-2.5 py-1.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
      >
        <option value="">Todos os responsáveis</option>
        {currentUserId && (
          <option value={currentUserId}>Atribuídas a mim</option>
        )}
        {profiles
          .filter((p) => p.id !== currentUserId)
          .map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name}
            </option>
          ))}
        <option value="none">Sem responsável</option>
      </select>

      <select
        value={values.project}
        onChange={(e) => onChange({ ...values, project: e.target.value })}
        className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-2.5 py-1.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
      >
        <option value="">Todos os projetos</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export function applyTaskFilters<T extends { title: string; description: string | null; assigned_to: string | null; project_id: string | null }>(
  tasks: T[],
  filters: TaskFilterValues
): T[] {
  return tasks.filter((task) => {
    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      const matches =
        task.title.toLowerCase().includes(q) ||
        (task.description ?? "").toLowerCase().includes(q);
      if (!matches) return false;
    }

    if (filters.assignee) {
      if (filters.assignee === "none" && task.assigned_to !== null) return false;
      if (filters.assignee !== "none" && task.assigned_to !== filters.assignee) return false;
    }

    if (filters.project && task.project_id !== filters.project) return false;

    return true;
  });
}

"use client";

import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { TaskFilters, applyTaskFilters, type TaskFilterValues } from "@/components/tasks/task-filters";
import { TaskSection } from "@/components/tasks/task-section";
import type { Profile, Project, TaskWithRelations } from "@/lib/types";

type LembretesViewProps = {
  tasks: TaskWithRelations[];
  projects: Project[];
  profiles: Profile[];
  currentUserId?: string;
};

export function LembretesView({ tasks, projects, profiles, currentUserId }: LembretesViewProps) {
  const [filters, setFilters] = useState<TaskFilterValues>({
    search: "",
    assignee: "",
    project: "",
  });

  const urgent = useMemo(() => tasks.filter((t) => t.is_urgent), [tasks]);
  const filtered = useMemo(() => applyTaskFilters(urgent, filters), [urgent, filters]);

  const pending = filtered.filter((t) => t.status === "todo");
  const resolved = filtered.filter((t) => t.status === "done");

  return (
    <div className="mx-auto max-w-2xl pb-24">
      <div className="px-4 pt-6 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-[var(--color-urgent-soft)] text-[var(--color-urgent)]">
            <AlertTriangle size={16} />
          </span>
          <h1 className="text-xl font-semibold text-[var(--color-text)]">Lembretes</h1>
        </div>
        <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">
          Tarefas marcadas como urgentes, para não passarem despercebidas.
        </p>
      </div>

      <TaskFilters
        profiles={profiles}
        projects={projects}
        values={filters}
        onChange={setFilters}
        currentUserId={currentUserId}
      />

      <div className="px-2.5 sm:px-4">
        <TaskSection
          title="Pendentes"
          tasks={pending}
          projects={projects}
          profiles={profiles}
          urgentTitle
          emptyMessage="Nenhum lembrete urgente pendente."
        />
        <TaskSection
          title="Resolvidas"
          tasks={resolved}
          projects={projects}
          profiles={profiles}
          showCompletedDate
        />
      </div>
    </div>
  );
}

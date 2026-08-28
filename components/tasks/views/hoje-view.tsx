"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TaskFilters, applyTaskFilters, type TaskFilterValues } from "@/components/tasks/task-filters";
import { TaskSection } from "@/components/tasks/task-section";
import { todayISO } from "@/lib/dates";
import type { Profile, Project, TaskWithRelations } from "@/lib/types";

type HojeViewProps = {
  tasks: TaskWithRelations[];
  projects: Project[];
  profiles: Profile[];
  currentUserId?: string;
};

export function HojeView({ tasks, projects, profiles, currentUserId }: HojeViewProps) {
  const [filters, setFilters] = useState<TaskFilterValues>({
    search: "",
    assignee: "",
    project: "",
  });

  const today = todayISO();
  const filtered = useMemo(() => applyTaskFilters(tasks, filters), [tasks, filters]);

  const overdue = filtered.filter((t) => t.status === "todo" && t.due_date && t.due_date < today);
  const dueToday = filtered.filter((t) => t.due_date === today && t.status === "todo");
  const completedToday = filtered.filter((t) => t.status === "done" && t.due_date === today);

  const isEmpty = overdue.length === 0 && dueToday.length === 0 && completedToday.length === 0;

  return (
    <div className="mx-auto max-w-2xl pb-24">
      <PageHeader title="Hoje" />
      <TaskFilters
        profiles={profiles}
        projects={projects}
        values={filters}
        onChange={setFilters}
        currentUserId={currentUserId}
      />

      <div className="px-2.5 sm:px-4">
        <TaskSection
          title="Atrasadas"
          tasks={overdue}
          projects={projects}
          profiles={profiles}
          urgentTitle
        />
        <TaskSection
          title="Para hoje"
          tasks={dueToday}
          projects={projects}
          profiles={profiles}
          hideDate
          emptyMessage="Nenhuma tarefa para hoje."
        />
        <TaskSection
          title="Concluídas hoje"
          tasks={completedToday}
          projects={projects}
          profiles={profiles}
          hideDate
          showCompletedDate
        />

        {isEmpty && (
          <p className="px-2.5 py-10 text-center text-sm text-[var(--color-text-faint)]">
            Nenhuma tarefa pendente por aqui.
          </p>
        )}
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TaskFilters, applyTaskFilters, type TaskFilterValues } from "@/components/tasks/task-filters";
import { KanbanBoard } from "@/components/tasks/kanban/kanban-board";
import { currentWeekBoundsISO } from "@/lib/dates";
import type { Profile, Project, TaskWithRelations } from "@/lib/types";

type SemanaViewProps = {
  tasks: TaskWithRelations[];
  projects: Project[];
  profiles: Profile[];
  currentUserId?: string;
};

export function SemanaView({ tasks, projects, profiles, currentUserId }: SemanaViewProps) {
  const [filters, setFilters] = useState<TaskFilterValues>({
    search: "",
    assignee: "",
    project: "",
  });

  const { start: weekStart, end: weekEnd } = currentWeekBoundsISO();

  const filtered = useMemo(() => applyTaskFilters(tasks, filters), [tasks, filters]);
  const thisWeek = filtered.filter((t) => {
    if (!t.due_date) return t.status !== "done";
    return t.due_date >= weekStart && t.due_date <= weekEnd;
  });

  return (
    <div className="pb-10">
      <div className="mx-auto max-w-2xl">
        <PageHeader title="Semana" subtitle="Visão geral da semana atual" />
        <TaskFilters
          profiles={profiles}
          projects={projects}
          values={filters}
          onChange={setFilters}
          currentUserId={currentUserId}
        />
      </div>

      <div className="mt-2">
        <KanbanBoard tasks={thisWeek} projects={projects} profiles={profiles} />
      </div>
    </div>
  );
}

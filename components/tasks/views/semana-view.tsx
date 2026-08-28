"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TaskFilters, applyTaskFilters, type TaskFilterValues } from "@/components/tasks/task-filters";
import { TaskSection } from "@/components/tasks/task-section";
import { currentWeekBoundsISO, todayISO, tomorrowISO } from "@/lib/dates";
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

  const today = todayISO();
  const tomorrow = tomorrowISO();
  const { end: weekEnd } = currentWeekBoundsISO();

  const filtered = useMemo(() => applyTaskFilters(tasks, filters), [tasks, filters]);
  const withDate = filtered.filter((t) => t.due_date);

  const overdue = withDate.filter((t) => t.status === "todo" && t.due_date! < today);
  const dueToday = withDate.filter((t) => t.due_date === today);
  const dueTomorrow = withDate.filter((t) => t.due_date === tomorrow);
  const restOfWeek = withDate.filter((t) => t.due_date! > tomorrow && t.due_date! <= weekEnd);

  return (
    <div className="mx-auto max-w-2xl pb-24">
      <PageHeader title="Semana" subtitle="Visão geral da semana atual" />
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
          title="Hoje"
          tasks={dueToday}
          projects={projects}
          profiles={profiles}
          hideDate
          emptyMessage="Nada para hoje."
        />
        <TaskSection
          title="Amanhã"
          tasks={dueTomorrow}
          projects={projects}
          profiles={profiles}
          hideDate
          emptyMessage="Nada para amanhã."
        />
        <TaskSection
          title="Resto da semana"
          tasks={restOfWeek}
          projects={projects}
          profiles={profiles}
          emptyMessage="Nada planejado para o resto da semana."
        />
      </div>
    </div>
  );
}

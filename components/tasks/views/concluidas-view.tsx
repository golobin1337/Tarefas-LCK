"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TaskFilters, applyTaskFilters, type TaskFilterValues } from "@/components/tasks/task-filters";
import { TaskSection } from "@/components/tasks/task-section";
import { currentWeekBoundsISO, formatDayLabel } from "@/lib/dates";
import type { Profile, Project, TaskWithRelations } from "@/lib/types";

type ConcluidasViewProps = {
  tasks: TaskWithRelations[];
  projects: Project[];
  profiles: Profile[];
  currentUserId?: string;
};

export function ConcluidasView({ tasks, projects, profiles, currentUserId }: ConcluidasViewProps) {
  const [filters, setFilters] = useState<TaskFilterValues>({
    search: "",
    assignee: "",
    project: "",
  });

  const { start, end } = currentWeekBoundsISO();

  const doneThisWeek = useMemo(() => {
    return tasks.filter((t) => {
      if (t.status !== "done" || !t.completed_at) return false;
      const day = t.completed_at.slice(0, 10);
      return day >= start && day <= end;
    });
  }, [tasks, start, end]);

  const filtered = useMemo(() => applyTaskFilters(doneThisWeek, filters), [doneThisWeek, filters]);

  const groups = useMemo(() => {
    const map = new Map<string, TaskWithRelations[]>();
    for (const task of filtered) {
      const day = task.completed_at!.slice(0, 10);
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(task);
    }
    return Array.from(map.entries())
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([day, dayTasks]) => ({
        day,
        label: formatDayLabel(day),
        tasks: dayTasks.sort((a, b) => (a.completed_at! < b.completed_at! ? 1 : -1)),
      }));
  }, [filtered]);

  return (
    <div className="mx-auto max-w-2xl pb-24">
      <PageHeader title="Concluídas" subtitle="O que já foi feito nesta semana" />
      <TaskFilters
        profiles={profiles}
        projects={projects}
        values={filters}
        onChange={setFilters}
        currentUserId={currentUserId}
      />

      <div className="px-2.5 sm:px-4">
        {groups.length === 0 && (
          <p className="px-2.5 py-10 text-center text-sm text-[var(--color-text-faint)]">
            Nenhuma tarefa concluída nesta semana ainda.
          </p>
        )}

        {groups.map((group) => (
          <TaskSection
            key={group.day}
            title={group.label}
            tasks={group.tasks}
            projects={projects}
            profiles={profiles}
            hideDate
            showCompletedDate
          />
        ))}
      </div>
    </div>
  );
}

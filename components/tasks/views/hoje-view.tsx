"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TaskFilters, applyTaskFilters, type TaskFilterValues } from "@/components/tasks/task-filters";
import { TaskSection } from "@/components/tasks/task-section";
import { KanbanBoard } from "@/components/tasks/kanban/kanban-board";
import { DailyRoutineColumn } from "@/components/tasks/kanban/daily-routine-column";
import { todayISO } from "@/lib/dates";
import type { DailyRoutineWithStatus, Profile, Project, TaskWithRelations } from "@/lib/types";

type HojeViewProps = {
  tasks: TaskWithRelations[];
  projects: Project[];
  profiles: Profile[];
  routines: DailyRoutineWithStatus[];
  currentUserId?: string;
};

export function HojeView({ tasks, projects, profiles, routines, currentUserId }: HojeViewProps) {
  const [filters, setFilters] = useState<TaskFilterValues>({
    search: "",
    assignee: "",
    project: "",
  });

  const today = todayISO();
  const filtered = useMemo(() => applyTaskFilters(tasks, filters), [tasks, filters]);

  const overdue = filtered.filter(
    (t) => t.status !== "done" && t.due_date && t.due_date < today
  );
  const dueToday = filtered.filter((t) => t.due_date === today);

  return (
    <div className="pb-10">
      <div className="mx-auto max-w-2xl">
        <PageHeader title="Hoje" />
        <TaskFilters
          profiles={profiles}
          projects={projects}
          values={filters}
          onChange={setFilters}
          currentUserId={currentUserId}
        />

        <div className="px-2.5 sm:px-4">
          <TaskSection title="Atrasadas" tasks={overdue} projects={projects} profiles={profiles} urgentTitle />
        </div>
      </div>

      <div className="mt-2">
        <KanbanBoard
          tasks={dueToday}
          projects={projects}
          profiles={profiles}
          defaultDueDate={today}
          extraColumn={<DailyRoutineColumn routines={routines} profiles={profiles} />}
        />
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TaskFilters, applyTaskFilters, type TaskFilterValues } from "@/components/tasks/task-filters";
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

  const boardTasks = filtered.filter((t) => {
    if (!t.due_date) {
      if (t.status !== "done") return true;
      return !!t.completed_at && t.completed_at.slice(0, 10) === today;
    }
    return t.due_date === today || (t.status !== "done" && t.due_date < today);
  });

  const doneCount = boardTasks.filter((t) => t.status === "done").length;
  const totalCount = boardTasks.length;
  const progressPct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  const fullDate = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });
  const fullDateLabel = fullDate.charAt(0).toUpperCase() + fullDate.slice(1);

  return (
    <div className="pb-10">
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 px-4 pt-6 sm:px-6">
          <div>
            <h1 className="text-xl font-semibold text-[var(--color-text)]">Hoje</h1>
            <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">{fullDateLabel}</p>
          </div>

          {totalCount > 0 && (
            <div className="flex min-w-[160px] flex-col gap-1.5">
              <div className="flex items-center justify-between gap-4 text-xs text-[var(--color-text-muted)]">
                <span>Progresso do dia</span>
                <span className="font-medium text-[var(--color-text)]">
                  {doneCount}/{totalCount}
                </span>
              </div>
              <div className="h-1.5 w-40 overflow-hidden rounded-full bg-[var(--color-bg-hover)]">
                <div
                  className="h-full rounded-full bg-[var(--color-success)] transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <TaskFilters
          profiles={profiles}
          projects={projects}
          values={filters}
          onChange={setFilters}
          currentUserId={currentUserId}
        />
      </div>

      <div className="mt-2">
        <KanbanBoard
          tasks={boardTasks}
          projects={projects}
          profiles={profiles}
          defaultDueDate={today}
          extraColumn={<DailyRoutineColumn routines={routines} profiles={profiles} />}
        />
      </div>
    </div>
  );
}

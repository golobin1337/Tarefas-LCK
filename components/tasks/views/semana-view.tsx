"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TaskFilters, applyTaskFilters, type TaskFilterValues } from "@/components/tasks/task-filters";
import { KanbanBoard } from "@/components/tasks/kanban/kanban-board";
import { DailyRoutineColumn } from "@/components/tasks/kanban/daily-routine-column";
import { currentWeekBoundsISO, todayISO } from "@/lib/dates";
import type { DailyRoutineWithStatus, Profile, Project, TaskWithRelations } from "@/lib/types";

type SemanaViewProps = {
  tasks: TaskWithRelations[];
  projects: Project[];
  profiles: Profile[];
  routines: DailyRoutineWithStatus[];
  currentUserId?: string;
};

export function SemanaView({
  tasks,
  projects,
  profiles,
  routines,
  currentUserId,
}: SemanaViewProps) {
  const [filters, setFilters] = useState<TaskFilterValues>({
    search: "",
    assignee: "",
    project: "",
  });

  const today = todayISO();
  const { start: weekStart, end: weekEnd } = currentWeekBoundsISO();

  const filtered = useMemo(() => applyTaskFilters(tasks, filters), [tasks, filters]);

  // A Fazer/Fazendo: qualquer tarefa pendente relevante agora — sem data,
  // atrasada (de qualquer época, pra nunca sumir do quadro) ou com
  // vencimento até o fim desta semana.
  const pendingTasks = filtered.filter((t) => {
    if (t.status === "done") return false;
    if (!t.due_date) return true;
    if (t.due_date < today) return true;
    return t.due_date <= weekEnd;
  });

  // Concluído: por enquanto sem reset semanal — mostra tudo que já foi
  // concluído, pra nada sumir do quadro. O histórico completo também
  // sempre disponível em Concluídas.
  const completedTasks = filtered.filter((t) => t.status === "done");

  const boardTasks = [...pendingTasks, ...completedTasks];

  // O indicador de progresso continua só da semana atual (desde segunda),
  // mesmo com a coluna Concluído agora mostrando tudo.
  const completedThisWeek = completedTasks.filter((t) => {
    if (!t.completed_at) return false;
    const completedDate = t.completed_at.slice(0, 10);
    return completedDate >= weekStart && completedDate <= weekEnd;
  });
  const doneCount = completedThisWeek.length;
  const totalCount = pendingTasks.length + doneCount;
  const progressPct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  const fullDate = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });
  const fullDateLabel = fullDate.charAt(0).toUpperCase() + fullDate.slice(1);

  return (
    <div className="pb-10">
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 px-4 pt-6 sm:px-6">
          <div>
            <h1 className="text-xl font-semibold text-[var(--color-text)]">Semana</h1>
            <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">{fullDateLabel}</p>
          </div>

          {totalCount > 0 && (
            <div className="flex min-w-[160px] flex-col gap-1.5">
              <div className="flex items-center justify-between gap-4 text-xs text-[var(--color-text-muted)]">
                <span>Progresso da semana</span>
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

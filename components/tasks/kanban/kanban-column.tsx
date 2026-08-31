"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Inbox, PartyPopper, Plus, Timer } from "lucide-react";
import { KanbanCard } from "@/components/tasks/kanban/kanban-card";
import type { TaskStatus, TaskWithRelations } from "@/lib/types";

const NEXT_STATUS: Partial<Record<TaskStatus, TaskStatus>> = {
  todo: "doing",
};

const EMPTY_STATE: Record<TaskStatus, { icon: typeof Inbox; message: string }> = {
  todo: { icon: Inbox, message: "Nada por aqui ainda" },
  doing: { icon: Timer, message: "Nenhuma tarefa em andamento" },
  done: { icon: PartyPopper, message: "Ainda nada concluído hoje" },
};

type KanbanColumnProps = {
  status: TaskStatus;
  title: string;
  taskIds: string[];
  tasksById: Record<string, TaskWithRelations>;
  onCardClick: (task: TaskWithRelations) => void;
  onAddClick: () => void;
  onQuickMove: (taskId: string, toStatus: TaskStatus) => void;
};

export function KanbanColumn({
  status,
  title,
  taskIds,
  tasksById,
  onCardClick,
  onAddClick,
  onQuickMove,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const nextStatus = NEXT_STATUS[status];
  const empty = EMPTY_STATE[status];
  const EmptyIcon = empty.icon;

  return (
    <div className="flex h-[70vh] w-72 shrink-0 flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] sm:w-80">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] px-3.5 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-tight text-[var(--color-text)]">
            {title}
          </span>
          <span className="rounded-full bg-[var(--color-bg-hover)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--color-text-muted)]">
            {taskIds.length}
          </span>
        </div>
        <button
          type="button"
          onClick={onAddClick}
          className="flex size-6 items-center justify-center rounded-md text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]"
          aria-label={`Nova tarefa em ${title}`}
          title={`Nova tarefa em ${title}`}
        >
          <Plus size={15} />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={`flex flex-1 flex-col gap-2 overflow-y-auto p-2.5 transition-colors ${
          isOver ? "bg-[var(--color-accent-soft)]" : ""
        }`}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {taskIds.map((id) => {
            const task = tasksById[id];
            if (!task) return null;
            return (
              <KanbanCard
                key={id}
                task={task}
                onClick={() => onCardClick(task)}
                onComplete={status !== "done" ? () => onQuickMove(id, "done") : undefined}
                onAdvance={nextStatus ? () => onQuickMove(id, nextStatus) : undefined}
              />
            );
          })}
        </SortableContext>

        {taskIds.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--color-border)] py-8 text-center">
            <EmptyIcon size={20} className="text-[var(--color-text-faint)]" />
            <p className="px-4 text-xs text-[var(--color-text-faint)]">{empty.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

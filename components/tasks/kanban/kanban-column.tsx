"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { KanbanCard } from "@/components/tasks/kanban/kanban-card";
import type { TaskStatus, TaskWithRelations } from "@/lib/types";

type KanbanColumnProps = {
  status: TaskStatus;
  title: string;
  taskIds: string[];
  tasksById: Record<string, TaskWithRelations>;
  onCardClick: (task: TaskWithRelations) => void;
  onAddClick: () => void;
};

export function KanbanColumn({
  status,
  title,
  taskIds,
  tasksById,
  onCardClick,
  onAddClick,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex h-[70vh] w-72 shrink-0 flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] sm:w-80">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[var(--color-text)]">{title}</span>
          <span className="rounded-full bg-[var(--color-bg-hover)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--color-text-muted)]">
            {taskIds.length}
          </span>
        </div>
        <button
          type="button"
          onClick={onAddClick}
          className="flex size-6 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]"
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
            return <KanbanCard key={id} task={task} onClick={() => onCardClick(task)} />;
          })}
        </SortableContext>

        {taskIds.length === 0 && (
          <p className="px-1 py-6 text-center text-xs text-[var(--color-text-faint)]">
            Nenhuma tarefa
          </p>
        )}
      </div>
    </div>
  );
}

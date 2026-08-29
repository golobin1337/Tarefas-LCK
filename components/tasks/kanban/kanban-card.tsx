"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle, AlignLeft, ListChecks } from "lucide-react";
import { initials } from "@/lib/format";
import { PRIORITY_COLOR_VAR } from "@/lib/priority";
import type { TaskWithRelations } from "@/lib/types";

type KanbanCardContentProps = {
  task: TaskWithRelations;
  dragging?: boolean;
};

export function KanbanCardContent({ task, dragging }: KanbanCardContentProps) {
  const checklistTotal = task.checklist?.length ?? 0;
  const checklistDone = task.checklist?.filter((i) => i.is_done).length ?? 0;

  return (
    <div
      className={`relative flex flex-col gap-2 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] py-3 pl-4 pr-3 text-left shadow-sm transition-shadow ${
        dragging ? "scale-105 shadow-md" : "hover:shadow-md"
      }`}
    >
      <span
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: PRIORITY_COLOR_VAR[task.priority] }}
      />

      <p className="text-sm text-[var(--color-text)]">{task.title}</p>

      {(task.is_urgent || task.project || task.due_date || checklistTotal > 0 || task.assignee) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {task.is_urgent && (
            <span className="flex items-center gap-1 rounded-full bg-[var(--color-urgent-soft)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--color-urgent)]">
              <AlertTriangle size={10} />
              Urgente
            </span>
          )}
          {task.project && (
            <span className="flex items-center gap-1 rounded-full bg-[var(--color-bg-hover)] px-1.5 py-0.5 text-[11px] text-[var(--color-text-muted)]">
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: task.project.color }}
              />
              {task.project.name}
            </span>
          )}
          {checklistTotal > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-[var(--color-bg-hover)] px-1.5 py-0.5 text-[11px] text-[var(--color-text-muted)]">
              <ListChecks size={10} />
              {checklistDone}/{checklistTotal}
            </span>
          )}
          {task.due_date && (
            <span className="rounded-full bg-[var(--color-bg-hover)] px-1.5 py-0.5 text-[11px] text-[var(--color-text-muted)]">
              {format(parseISO(task.due_date), "d 'de' MMM", { locale: ptBR })}
            </span>
          )}
          {task.assignee && (
            <span
              title={task.assignee.full_name}
              className="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[10px] font-semibold text-[var(--color-accent)]"
            >
              {initials(task.assignee.full_name)}
            </span>
          )}
        </div>
      )}

      {task.description && (
        <div className="flex items-center text-[var(--color-text-faint)]">
          <AlignLeft size={12} />
        </div>
      )}
    </div>
  );
}

type KanbanCardProps = {
  task: TaskWithRelations;
  onClick: () => void;
};

export function KanbanCard({ task, onClick }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={isDragging ? "cursor-grabbing opacity-40" : "cursor-grab active:cursor-grabbing"}
    >
      <KanbanCardContent task={task} />
    </div>
  );
}

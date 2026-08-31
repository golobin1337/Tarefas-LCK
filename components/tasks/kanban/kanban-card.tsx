"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle, AlignLeft, Check, ChevronRight, ListChecks, Pencil } from "lucide-react";
import { initials } from "@/lib/format";
import { todayISO } from "@/lib/dates";
import { PRIORITY_COLOR_VAR } from "@/lib/priority";
import type { TaskWithRelations } from "@/lib/types";

type QuickAction = {
  icon: typeof Check;
  label: string;
  onAction: () => void;
};

type KanbanCardContentProps = {
  task: TaskWithRelations;
  dragging?: boolean;
  onEdit?: () => void;
  onComplete?: () => void;
  onAdvance?: () => void;
};

export function KanbanCardContent({
  task,
  dragging,
  onEdit,
  onComplete,
  onAdvance,
}: KanbanCardContentProps) {
  const checklistTotal = task.checklist?.length ?? 0;
  const checklistDone = task.checklist?.filter((i) => i.is_done).length ?? 0;
  const isOverdue = task.status !== "done" && !!task.due_date && task.due_date < todayISO();

  const actions: QuickAction[] = [
    ...(onComplete ? [{ icon: Check, label: "Concluir", onAction: onComplete }] : []),
    ...(onAdvance ? [{ icon: ChevronRight, label: "Avançar", onAction: onAdvance }] : []),
    ...(onEdit ? [{ icon: Pencil, label: "Editar", onAction: onEdit }] : []),
  ];

  return (
    <div
      className={`group/card relative flex flex-col gap-2 overflow-hidden rounded-lg border bg-[var(--color-bg-elevated)] py-3 pl-4 pr-3 text-left shadow-sm transition-shadow ${
        isOverdue ? "border-[var(--color-urgent)]" : "border-[var(--color-border)]"
      } ${dragging ? "scale-105 shadow-md" : "hover:shadow-md"}`}
    >
      <span
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: PRIORITY_COLOR_VAR[task.priority] }}
      />

      <div className="flex items-start justify-between gap-2">
        <p className="flex-1 text-sm leading-snug text-[var(--color-text)]">{task.title}</p>

        {actions.length > 0 && (
          <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover/card:opacity-100">
            {actions.map(({ icon: Icon, label, onAction }) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                title={label}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onAction();
                }}
                className="flex size-6 items-center justify-center rounded-md text-[var(--color-text-faint)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]"
              >
                <Icon size={13} />
              </button>
            ))}
          </div>
        )}
      </div>

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
        {task.due_date ? (
          <span
            className={`rounded-full bg-[var(--color-bg-hover)] px-1.5 py-0.5 text-[11px] ${
              isOverdue ? "font-medium text-[var(--color-urgent)]" : "text-[var(--color-text-muted)]"
            }`}
          >
            {format(parseISO(task.due_date), "d 'de' MMM", { locale: ptBR })}
          </span>
        ) : (
          <span className="rounded-full bg-[var(--color-bg-hover)] px-1.5 py-0.5 text-[11px] text-[var(--color-text-faint)]">
            Sem data
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
  onComplete?: () => void;
  onAdvance?: () => void;
};

export function KanbanCard({ task, onClick, onComplete, onAdvance }: KanbanCardProps) {
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
      <KanbanCardContent
        task={task}
        onEdit={onClick}
        onComplete={onComplete}
        onAdvance={onAdvance}
      />
    </div>
  );
}

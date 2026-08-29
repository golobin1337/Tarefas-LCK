"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { format, isPast, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle } from "lucide-react";
import { TaskDetailModal } from "@/components/tasks/task-detail-modal";
import { setTaskStatus } from "@/lib/actions/tasks";
import { initials } from "@/lib/format";
import type { Profile, Project, TaskWithRelations } from "@/lib/types";

type TaskRowProps = {
  task: TaskWithRelations;
  projects: Project[];
  profiles: Profile[];
  hideDate?: boolean;
  showCompletedDate?: boolean;
};

export function TaskRow({
  task,
  projects,
  profiles,
  hideDate,
  showCompletedDate,
}: TaskRowProps) {
  const router = useRouter();
  const [status, setStatus] = useState(task.status);
  const [showUndo, setShowUndo] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDone = status === "done";
  const overdue =
    !isDone && task.due_date ? isPast(parseISO(task.due_date)) && task.due_date !== format(new Date(), "yyyy-MM-dd") : false;

  async function toggleStatus() {
    const next = isDone ? "todo" : "done";
    setStatus(next);

    if (undoTimer.current) clearTimeout(undoTimer.current);

    if (next === "done") {
      setShowUndo(true);
      undoTimer.current = setTimeout(() => setShowUndo(false), 4000);
    } else {
      setShowUndo(false);
    }

    try {
      await setTaskStatus(task.id, next);
      router.refresh();
    } catch {
      setStatus(isDone ? "done" : "todo");
    }
  }

  async function handleUndo() {
    setShowUndo(false);
    setStatus("todo");
    try {
      await setTaskStatus(task.id, "todo");
      router.refresh();
    } catch {
      setStatus("done");
    }
  }

  return (
    <>
      <div
        className={`group flex items-start gap-3 rounded-md px-2.5 py-2.5 transition-colors hover:bg-[var(--color-bg-hover)] ${
          isDone ? "opacity-60" : ""
        }`}
      >
        <button
          type="button"
          onClick={toggleStatus}
          aria-label={isDone ? "Marcar como não concluída" : "Marcar como concluída"}
          className={`mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            isDone
              ? "border-[var(--color-success)] bg-[var(--color-success)]"
              : task.is_urgent
              ? "border-[var(--color-urgent)] hover:bg-[var(--color-urgent-soft)]"
              : "border-[var(--color-text-faint)] hover:border-[var(--color-accent)]"
          }`}
        >
          {isDone && (
            <svg viewBox="0 0 16 16" fill="none" className="size-2.5">
              <path
                d="M3 8.5L6.2 11.5L13 4.5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="flex min-w-0 flex-1 flex-col items-start gap-1 text-left"
        >
          <span
            className={`text-sm text-[var(--color-text)] ${
              isDone ? "line-through decoration-[var(--color-text-faint)]" : ""
            }`}
          >
            {task.title}
          </span>

          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {task.is_urgent && (
              <span className="flex items-center gap-1 rounded-full bg-[var(--color-urgent-soft)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--color-urgent)]">
                <AlertTriangle size={10} />
                Urgente
              </span>
            )}

            {task.project && (
              <span className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted)]">
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: task.project.color }}
                />
                {task.project.name}
              </span>
            )}

            {!hideDate && task.due_date && (
              <span
                className={`text-[11px] ${
                  overdue ? "font-medium text-[var(--color-urgent)]" : "text-[var(--color-text-muted)]"
                }`}
              >
                {format(parseISO(task.due_date), "d 'de' MMM", { locale: ptBR })}
              </span>
            )}

            {showCompletedDate && task.completed_at && (
              <span className="text-[11px] text-[var(--color-text-muted)]">
                Concluída em{" "}
                {format(parseISO(task.completed_at), "d 'de' MMM 'às' HH:mm", { locale: ptBR })}
              </span>
            )}

            {task.assignee && (
              <span
                title={task.assignee.full_name}
                className="flex size-4 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[9px] font-semibold text-[var(--color-accent)]"
              >
                {initials(task.assignee.full_name)}
              </span>
            )}
          </span>
        </button>

        {showUndo && (
          <button
            type="button"
            onClick={handleUndo}
            className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
          >
            Desfazer
          </button>
        )}
      </div>

      <TaskDetailModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        task={task}
        projects={projects}
        profiles={profiles}
      />
    </>
  );
}

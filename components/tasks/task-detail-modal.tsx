"use client";

import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CalendarOff, Plus, Trash2, X } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { deleteTask, updateTask } from "@/lib/actions/tasks";
import { addChecklistItem, deleteChecklistItem, toggleChecklistItem } from "@/lib/actions/checklist";
import { PRIORITY_COLOR_VAR, PRIORITY_LABELS, PRIORITY_ORDER, PRIORITY_SOFT_VAR } from "@/lib/priority";
import type { ChecklistItem, Profile, Project, TaskPriority, TaskWithRelations } from "@/lib/types";

type TaskDetailModalProps = {
  open: boolean;
  onClose: () => void;
  task: TaskWithRelations | null;
  projects: Project[];
  profiles: Profile[];
};

export function TaskDetailModal({ open, onClose, task, projects, profiles }: TaskDetailModalProps) {
  return (
    <Modal open={open && !!task} onClose={onClose} title="Tarefa" maxWidthClassName="max-w-lg">
      {open && task && (
        <TaskDetailFields
          key={task.id}
          task={task}
          projects={projects}
          profiles={profiles}
          onClose={onClose}
        />
      )}
    </Modal>
  );
}

type TaskDetailFieldsProps = {
  task: TaskWithRelations;
  projects: Project[];
  profiles: Profile[];
  onClose: () => void;
};

function TaskDetailFields({ task, projects, profiles, onClose }: TaskDetailFieldsProps) {
  const router = useRouter();

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [dueDate, setDueDate] = useState(task.due_date ?? "");
  const [projectId, setProjectId] = useState(task.project_id ?? "");
  const [assignedTo, setAssignedTo] = useState(task.assigned_to ?? "");
  const [isUrgent, setIsUrgent] = useState(task.is_urgent);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    [...task.checklist].sort((a, b) => a.position - b.position)
  );
  const [newItemTitle, setNewItemTitle] = useState("");
  const [deleting, setDeleting] = useState(false);
  const newItemInputRef = useRef<HTMLInputElement>(null);

  async function persist(overrides: {
    title?: string;
    description?: string;
    due_date?: string;
    project_id?: string;
    assigned_to?: string;
    is_urgent?: boolean;
    priority?: TaskPriority;
  }) {
    try {
      await updateTask(task.id, {
        title: overrides.title ?? title,
        description: (overrides.description ?? description) || null,
        due_date: (overrides.due_date ?? dueDate) || null,
        project_id: (overrides.project_id ?? projectId) || null,
        assigned_to: (overrides.assigned_to ?? assignedTo) || null,
        is_urgent: overrides.is_urgent ?? isUrgent,
        priority: overrides.priority ?? priority,
      });
      router.refresh();
    } catch {
      // Mantém o valor local; o usuário pode tentar de novo editando o campo.
    }
  }

  function handleTitleBlur() {
    const trimmed = title.trim();
    if (!trimmed) {
      setTitle(task.title);
      return;
    }
    if (trimmed !== task.title) persist({ title: trimmed });
  }

  function handleTitleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
    }
  }

  function handleDescriptionBlur() {
    if (description !== (task.description ?? "")) persist({ description });
  }

  function handlePriorityChange(next: TaskPriority) {
    setPriority(next);
    persist({ priority: next });
  }

  function handleUrgentToggle() {
    const next = !isUrgent;
    setIsUrgent(next);
    persist({ is_urgent: next });
  }

  function handleDueDateChange(value: string) {
    setDueDate(value);
    persist({ due_date: value });
  }

  function handleProjectChange(value: string) {
    setProjectId(value);
    persist({ project_id: value });
  }

  function handleAssigneeChange(value: string) {
    setAssignedTo(value);
    persist({ assigned_to: value });
  }

  async function handleAddItem(e: FormEvent) {
    e.preventDefault();
    const value = newItemTitle.trim();
    if (!value) return;

    setNewItemTitle("");
    newItemInputRef.current?.focus();

    const tempId = `temp-${Date.now()}`;
    const position = checklist.length;
    setChecklist((items) => [
      ...items,
      { id: tempId, task_id: task.id, title: value, is_done: false, position, created_at: "" },
    ]);

    const { item, error } = await addChecklistItem(task.id, value, position);
    if (error || !item) {
      setChecklist((items) => items.filter((i) => i.id !== tempId));
      return;
    }
    setChecklist((items) => items.map((i) => (i.id === tempId ? item : i)));
    router.refresh();
  }

  async function handleToggleItem(item: ChecklistItem) {
    const nextDone = !item.is_done;
    setChecklist((items) =>
      items.map((i) => (i.id === item.id ? { ...i, is_done: nextDone } : i))
    );
    try {
      await toggleChecklistItem(item.id, nextDone);
      router.refresh();
    } catch {
      setChecklist((items) =>
        items.map((i) => (i.id === item.id ? { ...i, is_done: !nextDone } : i))
      );
    }
  }

  async function handleDeleteItem(id: string) {
    const previous = checklist;
    setChecklist((items) => items.filter((i) => i.id !== id));
    try {
      await deleteChecklistItem(id);
      router.refresh();
    } catch {
      setChecklist(previous);
    }
  }

  async function handleDeleteTask() {
    if (!window.confirm("Excluir esta tarefa permanentemente?")) return;
    setDeleting(true);
    try {
      await deleteTask(task.id);
      router.refresh();
      onClose();
    } finally {
      setDeleting(false);
    }
  }

  const doneCount = checklist.filter((i) => i.is_done).length;
  const progressPct = checklist.length ? Math.round((doneCount / checklist.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-5">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleTitleBlur}
        onKeyDown={handleTitleKeyDown}
        className="w-full rounded-md bg-transparent px-0 py-1 text-base font-semibold text-[var(--color-text)] outline-none focus:bg-[var(--color-bg-hover)] focus:px-2"
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        onBlur={handleDescriptionBlur}
        placeholder="Adicionar descrição..."
        rows={3}
        className="w-full resize-none rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-medium text-[var(--color-text-muted)]">Data</label>
            <button
              type="button"
              onClick={() => handleDueDateChange("")}
              className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${
                dueDate === ""
                  ? "text-[var(--color-accent)]"
                  : "text-[var(--color-text-faint)] hover:text-[var(--color-text-muted)]"
              }`}
            >
              <CalendarOff size={11} />
              Sem data definida
            </button>
          </div>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => handleDueDateChange(e.target.value)}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--color-text-muted)]">Projeto</label>
          <select
            value={projectId}
            onChange={(e) => handleProjectChange(e.target.value)}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
          >
            <option value="">Sem projeto</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--color-text-muted)]">
            Responsável
          </label>
          <select
            value={assignedTo}
            onChange={(e) => handleAssigneeChange(e.target.value)}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
          >
            <option value="">Sem responsável</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={handleUrgentToggle}
            className={`flex w-full items-center justify-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm font-medium transition-colors ${
              isUrgent
                ? "border-[var(--color-urgent)] bg-[var(--color-urgent-soft)] text-[var(--color-urgent)]"
                : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]"
            }`}
          >
            <AlertTriangle size={14} />
            Urgente
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[var(--color-text-muted)]">Prioridade</label>
        <div className="grid grid-cols-3 gap-2">
          {PRIORITY_ORDER.map((p) => {
            const active = priority === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => handlePriorityChange(p)}
                className="rounded-md border px-2.5 py-1.5 text-sm font-medium transition-colors"
                style={
                  active
                    ? {
                        borderColor: PRIORITY_COLOR_VAR[p],
                        backgroundColor: PRIORITY_SOFT_VAR[p],
                        color: PRIORITY_COLOR_VAR[p],
                      }
                    : {
                        borderColor: "var(--color-border)",
                        color: "var(--color-text-muted)",
                      }
                }
              >
                {PRIORITY_LABELS[p]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-[var(--color-text-muted)]">Checklist</label>
          {checklist.length > 0 && (
            <span className="text-xs text-[var(--color-text-faint)]">
              {doneCount}/{checklist.length} concluídos
            </span>
          )}
        </div>

        {checklist.length > 0 && (
          <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--color-bg-hover)]">
            <div
              className="h-full rounded-full bg-[var(--color-success)] transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}

        <div className="flex flex-col">
          {checklist.map((item) => (
            <div
              key={item.id}
              className="group flex items-center gap-2.5 rounded-md px-1 py-1.5 hover:bg-[var(--color-bg-hover)]"
            >
              <button
                type="button"
                onClick={() => handleToggleItem(item)}
                aria-label={item.is_done ? "Marcar como não concluído" : "Marcar como concluído"}
                className={`flex size-[16px] shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  item.is_done
                    ? "border-[var(--color-success)] bg-[var(--color-success)]"
                    : "border-[var(--color-text-faint)] hover:border-[var(--color-accent)]"
                }`}
              >
                {item.is_done && (
                  <svg viewBox="0 0 16 16" fill="none" className="size-2">
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
              <span
                className={`flex-1 text-sm text-[var(--color-text)] ${
                  item.is_done ? "line-through text-[var(--color-text-faint)]" : ""
                }`}
              >
                {item.title}
              </span>
              <button
                type="button"
                onClick={() => handleDeleteItem(item.id)}
                aria-label="Excluir item"
                className="flex size-6 shrink-0 items-center justify-center rounded-md text-[var(--color-text-faint)] opacity-0 hover:bg-[var(--color-urgent-soft)] hover:text-[var(--color-urgent)] group-hover:opacity-100"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddItem} className="flex items-center gap-2">
          <Plus size={14} className="shrink-0 text-[var(--color-text-faint)]" />
          <input
            ref={newItemInputRef}
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            placeholder="Adicionar item..."
            className="w-full rounded-md border border-transparent bg-transparent px-1 py-1 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-border)] focus:bg-[var(--color-bg)] focus:px-2"
          />
        </form>
      </div>

      <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4">
        <button
          type="button"
          onClick={handleDeleteTask}
          disabled={deleting}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-[var(--color-urgent)] hover:bg-[var(--color-urgent-soft)] disabled:opacity-60"
        >
          <Trash2 size={14} />
          Excluir tarefa
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

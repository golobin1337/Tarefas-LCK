"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { createTask, deleteTask, updateTask } from "@/lib/actions/tasks";
import type { Profile, Project, TaskWithRelations } from "@/lib/types";

type TaskFormModalProps = {
  open: boolean;
  onClose: () => void;
  projects: Project[];
  profiles: Profile[];
  task?: TaskWithRelations | null;
  defaultDueDate?: string | null;
};

export function TaskFormModal({
  open,
  onClose,
  projects,
  profiles,
  task,
  defaultDueDate,
}: TaskFormModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={task ? "Editar tarefa" : "Nova tarefa"}>
      {open && (
        <TaskFormFields
          onClose={onClose}
          projects={projects}
          profiles={profiles}
          task={task}
          defaultDueDate={defaultDueDate}
        />
      )}
    </Modal>
  );
}

type TaskFormFieldsProps = {
  onClose: () => void;
  projects: Project[];
  profiles: Profile[];
  task?: TaskWithRelations | null;
  defaultDueDate?: string | null;
};

function TaskFormFields({
  onClose,
  projects,
  profiles,
  task,
  defaultDueDate,
}: TaskFormFieldsProps) {
  const router = useRouter();
  const [form, setForm] = useState(() =>
    task
      ? {
          title: task.title,
          description: task.description ?? "",
          due_date: task.due_date ?? "",
          project_id: task.project_id ?? "",
          assigned_to: task.assigned_to ?? "",
          is_urgent: task.is_urgent,
        }
      : {
          title: "",
          description: "",
          due_date: defaultDueDate ?? "",
          project_id: "",
          assigned_to: "",
          is_urgent: false,
        }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("Dê um título para a tarefa.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const input = {
        title: form.title,
        description: form.description || null,
        due_date: form.due_date || null,
        project_id: form.project_id || null,
        assigned_to: form.assigned_to || null,
        is_urgent: form.is_urgent,
      };
      if (task) {
        await updateTask(task.id, input);
      } else {
        await createTask(input);
      }
      router.refresh();
      onClose();
    } catch {
      setError("Não foi possível salvar a tarefa. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!task) return;
    if (!window.confirm("Excluir esta tarefa permanentemente?")) return;
    setLoading(true);
    try {
      await deleteTask(task.id);
      router.refresh();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
      <div>
        <input
          autoFocus
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="O que precisa ser feito?"
          className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
        />
      </div>

      <div>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Descrição (opcional)"
          rows={2}
          className="w-full resize-none rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--color-text-muted)]">Data</label>
          <input
            type="date"
            value={form.due_date}
            onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--color-text-muted)]">Projeto</label>
          <select
            value={form.project_id}
            onChange={(e) => setForm((f) => ({ ...f, project_id: e.target.value }))}
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
            value={form.assigned_to}
            onChange={(e) => setForm((f) => ({ ...f, assigned_to: e.target.value }))}
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
            onClick={() => setForm((f) => ({ ...f, is_urgent: !f.is_urgent }))}
            className={`flex w-full items-center justify-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm font-medium transition-colors ${
              form.is_urgent
                ? "border-[var(--color-urgent)] bg-[var(--color-urgent-soft)] text-[var(--color-urgent)]"
                : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]"
            }`}
          >
            <AlertTriangle size={14} />
            Urgente
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-md bg-[var(--color-urgent-soft)] px-3 py-2 text-sm text-[var(--color-urgent)]">
          {error}
        </p>
      )}

      <div className="mt-1 flex items-center justify-between gap-2">
        {task ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-[var(--color-urgent)] hover:bg-[var(--color-urgent-soft)] disabled:opacity-60"
          >
            <Trash2 size={14} />
            Excluir
          </button>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-[var(--color-accent)] px-3.5 py-1.5 text-sm font-medium text-[var(--color-accent-foreground)] hover:bg-[var(--color-accent-hover)] disabled:opacity-60"
          >
            {loading ? "Salvando..." : task ? "Salvar" : "Adicionar tarefa"}
          </button>
        </div>
      </div>
    </form>
  );
}

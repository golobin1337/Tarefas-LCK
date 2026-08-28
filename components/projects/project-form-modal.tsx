"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { createProject, deleteProject, updateProject } from "@/lib/actions/projects";
import type { Project } from "@/lib/types";

const COLOR_PRESETS = [
  "#6366f1",
  "#3b82f6",
  "#0ea5e9",
  "#14b8a6",
  "#22c55e",
  "#eab308",
  "#f97316",
  "#ec4899",
  "#8b5cf6",
  "#6b7280",
];

type ProjectFormModalProps = {
  open: boolean;
  onClose: () => void;
  project?: Project | null;
  onDeleted?: () => void;
};

export function ProjectFormModal({ open, onClose, project, onDeleted }: ProjectFormModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={project ? "Editar projeto" : "Novo projeto"}>
      {open && (
        <ProjectFormFields
          onClose={onClose}
          project={project}
          onDeleted={onDeleted}
        />
      )}
    </Modal>
  );
}

type ProjectFormFieldsProps = {
  onClose: () => void;
  project?: Project | null;
  onDeleted?: () => void;
};

function ProjectFormFields({ onClose, project, onDeleted }: ProjectFormFieldsProps) {
  const router = useRouter();
  const [name, setName] = useState(project?.name ?? "");
  const [color, setColor] = useState(project?.color ?? COLOR_PRESETS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Dê um nome para o projeto.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      if (project) {
        await updateProject(project.id, { name, color });
      } else {
        await createProject({ name, color });
      }
      router.refresh();
      onClose();
    } catch {
      setError("Não foi possível salvar o projeto.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!project) return;
    if (
      !window.confirm(
        `Excluir o projeto "${project.name}"? As tarefas associadas ficarão sem projeto.`
      )
    )
      return;
    setLoading(true);
    try {
      await deleteProject(project.id);
      router.refresh();
      onClose();
      onDeleted?.();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[var(--color-text-muted)]">Nome</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Financeiro"
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[var(--color-text-muted)]">Cor</label>
        <div className="flex flex-wrap gap-2">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setColor(preset)}
              aria-label={`Selecionar cor ${preset}`}
              className={`size-6 rounded-full ring-offset-2 ring-offset-[var(--color-bg-elevated)] transition-shadow ${
                color === preset ? "ring-2 ring-[var(--color-text)]" : ""
              }`}
              style={{ backgroundColor: preset }}
            />
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-md bg-[var(--color-urgent-soft)] px-3 py-2 text-sm text-[var(--color-urgent)]">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-2">
        {project ? (
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
            {loading ? "Salvando..." : project ? "Salvar" : "Criar projeto"}
          </button>
        </div>
      </div>
    </form>
  );
}

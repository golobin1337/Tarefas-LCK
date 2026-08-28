"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { ProjectFormModal } from "@/components/projects/project-form-modal";
import type { Project } from "@/lib/types";

type ProjectCardProps = {
  project: Project;
  pendingCount: number;
  totalCount: number;
};

export function ProjectCard({ project, pendingCount, totalCount }: ProjectCardProps) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <div className="group relative flex flex-col gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 transition-shadow hover:shadow-sm">
        <Link href={`/projetos/${project.id}`} className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: project.color }} />
            <span className="truncate text-sm font-semibold text-[var(--color-text)]">
              {project.name}
            </span>
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">
            {pendingCount} pendente{pendingCount === 1 ? "" : "s"} · {totalCount} no total
          </p>
        </Link>

        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-md text-[var(--color-text-faint)] opacity-0 transition-opacity hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)] group-hover:opacity-100"
          aria-label="Editar projeto"
        >
          <Pencil size={13} />
        </button>
      </div>

      <ProjectFormModal open={editOpen} onClose={() => setEditOpen(false)} project={project} />
    </>
  );
}

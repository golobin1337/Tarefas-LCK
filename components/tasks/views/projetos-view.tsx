"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectFormModal } from "@/components/projects/project-form-modal";
import type { Project, TaskWithRelations } from "@/lib/types";

type ProjetosViewProps = {
  projects: Project[];
  tasks: TaskWithRelations[];
};

export function ProjetosView({ projects, tasks }: ProjetosViewProps) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="mx-auto max-w-3xl pb-24">
      <div className="flex items-start justify-between gap-3 px-4 pt-6 sm:px-6">
        <PageHeader title="Projetos" subtitle="Áreas do negócio para organizar as tarefas" />
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="mt-6 flex shrink-0 items-center gap-1.5 rounded-md bg-[var(--color-accent)] px-3 py-1.5 text-sm font-medium text-[var(--color-accent-foreground)] hover:bg-[var(--color-accent-hover)]"
        >
          <Plus size={15} />
          Novo projeto
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 px-4 pt-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {projects.map((project) => {
          const projectTasks = tasks.filter((t) => t.project_id === project.id);
          const pendingCount = projectTasks.filter((t) => t.status === "todo").length;
          return (
            <ProjectCard
              key={project.id}
              project={project}
              pendingCount={pendingCount}
              totalCount={projectTasks.length}
            />
          );
        })}
      </div>

      {projects.length === 0 && (
        <p className="px-4 py-10 text-center text-sm text-[var(--color-text-faint)] sm:px-6">
          Nenhum projeto ainda. Crie o primeiro para começar a organizar as tarefas.
        </p>
      )}

      <ProjectFormModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}

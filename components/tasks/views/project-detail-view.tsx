"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { TaskFilters, applyTaskFilters, type TaskFilterValues } from "@/components/tasks/task-filters";
import { KanbanBoard } from "@/components/tasks/kanban/kanban-board";
import { ProjectFormModal } from "@/components/projects/project-form-modal";
import type { Profile, Project, TaskWithRelations } from "@/lib/types";

type ProjectDetailViewProps = {
  project: Project;
  tasks: TaskWithRelations[];
  projects: Project[];
  profiles: Profile[];
  currentUserId?: string;
};

export function ProjectDetailView({
  project,
  tasks,
  projects,
  profiles,
  currentUserId,
}: ProjectDetailViewProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<TaskFilterValues>({
    search: "",
    assignee: "",
    project: "",
  });
  const [editOpen, setEditOpen] = useState(false);

  const filtered = useMemo(() => applyTaskFilters(tasks, filters), [tasks, filters]);

  return (
    <div className="pb-10">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between gap-3 px-4 pt-6 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span
              className="size-3.5 shrink-0 rounded-full"
              style={{ backgroundColor: project.color }}
            />
            <h1 className="text-xl font-semibold text-[var(--color-text)]">{project.name}</h1>
          </div>
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]"
          >
            <Pencil size={14} />
            Editar
          </button>
        </div>

        <TaskFilters
          profiles={profiles}
          projects={projects}
          values={filters}
          onChange={setFilters}
          currentUserId={currentUserId}
        />
      </div>

      <div className="mt-2">
        <KanbanBoard
          tasks={filtered}
          projects={projects}
          profiles={profiles}
          defaultProjectId={project.id}
        />
      </div>

      <ProjectFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        project={project}
        onDeleted={() => router.push("/projetos")}
      />
    </div>
  );
}

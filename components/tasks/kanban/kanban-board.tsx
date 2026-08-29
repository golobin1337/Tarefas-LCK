"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { KanbanColumn } from "@/components/tasks/kanban/kanban-column";
import { KanbanCardContent } from "@/components/tasks/kanban/kanban-card";
import { TaskFormModal } from "@/components/tasks/task-form-modal";
import { TaskDetailModal } from "@/components/tasks/task-detail-modal";
import { setTaskStatus } from "@/lib/actions/tasks";
import type { Profile, Project, TaskStatus, TaskWithRelations } from "@/lib/types";

const COLUMNS: { status: TaskStatus; title: string }[] = [
  { status: "todo", title: "A Fazer" },
  { status: "doing", title: "Fazendo" },
  { status: "done", title: "Concluído" },
];

type KanbanBoardProps = {
  tasks: TaskWithRelations[];
  projects: Project[];
  profiles: Profile[];
  defaultDueDate?: string | null;
  defaultProjectId?: string | null;
};

function groupByStatus(tasks: TaskWithRelations[]): Record<TaskStatus, string[]> {
  const groups: Record<TaskStatus, string[]> = { todo: [], doing: [], done: [] };
  for (const task of tasks) {
    groups[task.status].push(task.id);
  }
  return groups;
}

function taskSignature(tasks: TaskWithRelations[]): string {
  return tasks
    .map((t) =>
      [t.id, t.status, t.title, t.due_date, t.project_id, t.assigned_to, t.is_urgent].join(":")
    )
    .sort()
    .join("|");
}

export function KanbanBoard({
  tasks,
  projects,
  profiles,
  defaultDueDate,
  defaultProjectId,
}: KanbanBoardProps) {
  const router = useRouter();

  const tasksById = useMemo(() => {
    const map: Record<string, TaskWithRelations> = {};
    for (const t of tasks) map[t.id] = t;
    return map;
  }, [tasks]);

  const signature = useMemo(() => taskSignature(tasks), [tasks]);
  const [lastSignature, setLastSignature] = useState(signature);
  const [columns, setColumns] = useState<Record<TaskStatus, string[]>>(() => groupByStatus(tasks));

  if (signature !== lastSignature) {
    setLastSignature(signature);
    setColumns(groupByStatus(tasks));
  }

  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<TaskWithRelations | null>(null);
  const [createStatus, setCreateStatus] = useState<TaskStatus | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function findColumnOf(id: string): TaskStatus | null {
    for (const col of COLUMNS) {
      if (columns[col.status].includes(id)) return col.status;
    }
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const draggedId = active.id as string;
    const overId = over.id as string;
    const isOverColumn = COLUMNS.some((c) => c.status === overId);

    const fromStatus = findColumnOf(draggedId);
    const toStatus = isOverColumn ? (overId as TaskStatus) : findColumnOf(overId);
    if (!fromStatus || !toStatus) return;
    if (fromStatus === toStatus && draggedId === overId) return;

    setColumns((prev) => {
      const sourceItems = [...prev[fromStatus]];
      const activeIndex = sourceItems.indexOf(draggedId);
      if (activeIndex === -1) return prev;
      sourceItems.splice(activeIndex, 1);

      if (fromStatus === toStatus) {
        const overIndex = isOverColumn ? sourceItems.length : sourceItems.indexOf(overId);
        sourceItems.splice(overIndex < 0 ? sourceItems.length : overIndex, 0, draggedId);
        return { ...prev, [fromStatus]: sourceItems };
      }

      const destItems = [...prev[toStatus]];
      const overIndex = isOverColumn ? destItems.length : destItems.indexOf(overId);
      destItems.splice(overIndex < 0 ? destItems.length : overIndex, 0, draggedId);
      return { ...prev, [fromStatus]: sourceItems, [toStatus]: destItems };
    });

    if (fromStatus !== toStatus) {
      setTaskStatus(draggedId, toStatus)
        .then(() => router.refresh())
        .catch(() => {
          setColumns((prev) => {
            const destItems = prev[toStatus].filter((id) => id !== draggedId);
            const sourceItems = [...prev[fromStatus], draggedId];
            return { ...prev, [toStatus]: destItems, [fromStatus]: sourceItems };
          });
        });
    }
  }

  const activeTask = activeId ? tasksById[activeId] : null;

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex gap-4 overflow-x-auto px-4 pb-6 sm:px-6">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.status}
              status={col.status}
              title={col.title}
              taskIds={columns[col.status]}
              tasksById={tasksById}
              onCardClick={(task) => setEditingTask(task)}
              onAddClick={() => setCreateStatus(col.status)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <KanbanCardContent task={activeTask} dragging /> : null}
        </DragOverlay>
      </DndContext>

      <TaskDetailModal
        open={editingTask !== null}
        onClose={() => setEditingTask(null)}
        task={editingTask}
        projects={projects}
        profiles={profiles}
      />

      <TaskFormModal
        open={createStatus !== null}
        onClose={() => setCreateStatus(null)}
        projects={projects}
        profiles={profiles}
        defaultDueDate={defaultDueDate}
        defaultProjectId={defaultProjectId}
        defaultStatus={createStatus ?? "todo"}
      />
    </>
  );
}

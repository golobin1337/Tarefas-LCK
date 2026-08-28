import { TaskRow } from "@/components/tasks/task-row";
import type { Profile, Project, TaskWithRelations } from "@/lib/types";

type TaskSectionProps = {
  title: string;
  tasks: TaskWithRelations[];
  projects: Project[];
  profiles: Profile[];
  hideDate?: boolean;
  showCompletedDate?: boolean;
  urgentTitle?: boolean;
  emptyMessage?: string;
};

export function TaskSection({
  title,
  tasks,
  projects,
  profiles,
  hideDate,
  showCompletedDate,
  urgentTitle,
  emptyMessage,
}: TaskSectionProps) {
  if (tasks.length === 0 && !emptyMessage) return null;

  return (
    <section className="mb-6">
      <div className="mb-1 flex items-center gap-2 px-2.5">
        <h2
          className={`text-[13px] font-semibold ${
            urgentTitle ? "text-[var(--color-urgent)]" : "text-[var(--color-text)]"
          }`}
        >
          {title}
        </h2>
        <span className="text-[13px] text-[var(--color-text-faint)]">{tasks.length}</span>
      </div>

      {tasks.length === 0 ? (
        <p className="px-2.5 py-2 text-sm text-[var(--color-text-faint)]">{emptyMessage}</p>
      ) : (
        <div className="flex flex-col divide-y divide-[var(--color-border)]">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              projects={projects}
              profiles={profiles}
              hideDate={hideDate}
              showCompletedDate={showCompletedDate}
            />
          ))}
        </div>
      )}
    </section>
  );
}

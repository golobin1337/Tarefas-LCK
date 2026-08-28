import { notFound } from "next/navigation";
import { ProjectDetailView } from "@/components/tasks/views/project-detail-view";
import { getCurrentUser, getProfiles, getProjects, getTasks } from "@/lib/queries";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, projects, profiles, tasks] = await Promise.all([
    getCurrentUser(),
    getProjects(),
    getProfiles(),
    getTasks(),
  ]);

  const project = projects.find((p) => p.id === id);
  if (!project) notFound();

  const projectTasks = tasks.filter((t) => t.project_id === id);

  return (
    <ProjectDetailView
      project={project}
      tasks={projectTasks}
      projects={projects}
      profiles={profiles}
      currentUserId={user?.id}
    />
  );
}

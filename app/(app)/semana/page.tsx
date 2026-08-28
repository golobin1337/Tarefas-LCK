import { SemanaView } from "@/components/tasks/views/semana-view";
import { getCurrentUser, getProfiles, getProjects, getTasks } from "@/lib/queries";

export default async function SemanaPage() {
  const [user, tasks, projects, profiles] = await Promise.all([
    getCurrentUser(),
    getTasks(),
    getProjects(),
    getProfiles(),
  ]);

  return (
    <SemanaView
      tasks={tasks}
      projects={projects}
      profiles={profiles}
      currentUserId={user?.id}
    />
  );
}

import { ConcluidasView } from "@/components/tasks/views/concluidas-view";
import { getCurrentUser, getProfiles, getProjects, getTasks } from "@/lib/queries";

export default async function ConcluidasPage() {
  const [user, tasks, projects, profiles] = await Promise.all([
    getCurrentUser(),
    getTasks(),
    getProjects(),
    getProfiles(),
  ]);

  return (
    <ConcluidasView
      tasks={tasks}
      projects={projects}
      profiles={profiles}
      currentUserId={user?.id}
    />
  );
}

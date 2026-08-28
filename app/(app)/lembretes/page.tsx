import { LembretesView } from "@/components/tasks/views/lembretes-view";
import { getCurrentUser, getProfiles, getProjects, getTasks } from "@/lib/queries";

export default async function LembretesPage() {
  const [user, tasks, projects, profiles] = await Promise.all([
    getCurrentUser(),
    getTasks(),
    getProjects(),
    getProfiles(),
  ]);

  return (
    <LembretesView
      tasks={tasks}
      projects={projects}
      profiles={profiles}
      currentUserId={user?.id}
    />
  );
}

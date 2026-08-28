import { HojeView } from "@/components/tasks/views/hoje-view";
import { getCurrentUser, getProfiles, getProjects, getTasks } from "@/lib/queries";

export default async function HojePage() {
  const [user, tasks, projects, profiles] = await Promise.all([
    getCurrentUser(),
    getTasks(),
    getProjects(),
    getProfiles(),
  ]);

  return (
    <HojeView
      tasks={tasks}
      projects={projects}
      profiles={profiles}
      currentUserId={user?.id}
    />
  );
}

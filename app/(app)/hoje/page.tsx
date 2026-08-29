import { HojeView } from "@/components/tasks/views/hoje-view";
import { getCurrentUser, getDailyRoutines, getProfiles, getProjects, getTasks } from "@/lib/queries";

export default async function HojePage() {
  const [user, tasks, projects, profiles, routines] = await Promise.all([
    getCurrentUser(),
    getTasks(),
    getProjects(),
    getProfiles(),
    getDailyRoutines(),
  ]);

  return (
    <HojeView
      tasks={tasks}
      projects={projects}
      profiles={profiles}
      routines={routines}
      currentUserId={user?.id}
    />
  );
}

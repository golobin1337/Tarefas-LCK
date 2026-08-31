import { SemanaView } from "@/components/tasks/views/semana-view";
import { getCurrentUser, getDailyRoutines, getProfiles, getProjects, getTasks } from "@/lib/queries";

export default async function SemanaPage() {
  const [user, tasks, projects, profiles, routines] = await Promise.all([
    getCurrentUser(),
    getTasks(),
    getProjects(),
    getProfiles(),
    getDailyRoutines(),
  ]);

  return (
    <SemanaView
      tasks={tasks}
      projects={projects}
      profiles={profiles}
      routines={routines}
      currentUserId={user?.id}
    />
  );
}

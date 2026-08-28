import { format } from "date-fns";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser, getProfiles, getProjects, getTasks } from "@/lib/queries";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [user, profiles, projects, tasks] = await Promise.all([
    getCurrentUser(),
    getProfiles(),
    getProjects(),
    getTasks(),
  ]);

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const urgentCount = tasks.filter((t) => t.is_urgent && t.status === "todo").length;
  const todayCount = tasks.filter((t) => t.due_date === todayStr && t.status === "todo").length;
  const currentProfile = profiles.find((p) => p.id === user?.id) ?? null;

  return (
    <AppShell
      projects={projects}
      profiles={profiles}
      currentProfile={currentProfile}
      currentEmail={user?.email ?? ""}
      urgentCount={urgentCount}
      todayCount={todayCount}
    >
      {children}
    </AppShell>
  );
}

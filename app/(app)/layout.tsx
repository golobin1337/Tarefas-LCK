import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser, getProfiles, getProjects, getTasks } from "@/lib/queries";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [user, profiles, projects, tasks] = await Promise.all([
    getCurrentUser(),
    getProfiles(),
    getProjects(),
    getTasks(),
  ]);

  const urgentCount = tasks.filter((t) => t.is_urgent && t.status !== "done").length;
  const currentProfile = profiles.find((p) => p.id === user?.id) ?? null;

  return (
    <AppShell
      projects={projects}
      profiles={profiles}
      currentProfile={currentProfile}
      currentEmail={user?.email ?? ""}
      urgentCount={urgentCount}
    >
      {children}
    </AppShell>
  );
}

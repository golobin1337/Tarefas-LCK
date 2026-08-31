"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { QuickAddButton } from "@/components/tasks/quick-add-button";
import type { Profile, Project } from "@/lib/types";

type AppShellProps = {
  projects: Project[];
  profiles: Profile[];
  currentProfile: Profile | null;
  currentEmail: string;
  urgentCount: number;
  children: React.ReactNode;
};

export function AppShell({
  projects,
  profiles,
  currentProfile,
  currentEmail,
  urgentCount,
  children,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-[var(--color-bg)]">
      <Sidebar
        projects={projects}
        currentProfile={currentProfile}
        currentEmail={currentEmail}
        urgentCount={urgentCount}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex size-8 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]"
            aria-label="Abrir menu"
          >
            <Menu size={18} />
          </button>
          <span className="text-sm font-semibold text-[var(--color-text)]">Tarefas</span>
          <ThemeToggle />
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      <QuickAddButton projects={projects} profiles={profiles} />
    </div>
  );
}

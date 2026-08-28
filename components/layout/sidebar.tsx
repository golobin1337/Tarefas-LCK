"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Folder,
  LogOut,
  Sun,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import type { Profile, Project } from "@/lib/types";

type SidebarProps = {
  projects: Project[];
  currentProfile: Profile | null;
  currentEmail: string;
  urgentCount: number;
  todayCount: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

export function Sidebar({
  projects,
  currentProfile,
  currentEmail,
  urgentCount,
  todayCount,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: "/hoje", label: "Hoje", icon: Sun, badge: todayCount },
    { href: "/semana", label: "Semana", icon: CalendarDays, badge: 0 },
    { href: "/lembretes", label: "Lembretes", icon: AlertTriangle, badge: urgentCount, urgent: true },
    { href: "/concluidas", label: "Concluídas", icon: CheckCircle2, badge: 0 },
    { href: "/projetos", label: "Projetos", icon: Folder, badge: 0 },
  ];

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-elevated)] transition-transform md:static md:z-auto md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <span className="text-sm font-semibold tracking-tight text-[var(--color-text)]">
            Tarefas
          </span>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              onClick={onCloseMobile}
              className="flex size-8 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] md:hidden"
              aria-label="Fechar menu"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        <nav className="flex flex-col gap-0.5 px-2.5">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center justify-between rounded-md px-2.5 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                    : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon size={16} />
                  {item.label}
                </span>
                {item.badge > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                      item.urgent
                        ? "bg-[var(--color-urgent)] text-[var(--color-urgent-foreground)]"
                        : "bg-[var(--color-bg-hover)] text-[var(--color-text-muted)]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-5 flex-1 overflow-y-auto px-2.5">
          <p className="px-2.5 pb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-faint)]">
            Projetos
          </p>
          <div className="flex flex-col gap-0.5">
            {projects.map((project) => {
              const href = `/projetos/${project.id}`;
              const active = pathname === href;
              return (
                <Link
                  key={project.id}
                  href={href}
                  onClick={onCloseMobile}
                  className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                    active
                      ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-medium"
                      : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]"
                  }`}
                >
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="truncate">{project.name}</span>
                </Link>
              );
            })}
            {projects.length === 0 && (
              <p className="px-2.5 py-1 text-xs text-[var(--color-text-faint)]">
                Nenhum projeto ainda
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-[var(--color-border)] px-4 py-3.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[var(--color-text)]">
              {currentProfile?.full_name ?? currentEmail}
            </p>
            <p className="truncate text-xs text-[var(--color-text-faint)]">{currentEmail}</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]"
            aria-label="Sair"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}

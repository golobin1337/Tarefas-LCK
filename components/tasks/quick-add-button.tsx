"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { TaskFormModal } from "@/components/tasks/task-form-modal";
import type { Profile, Project } from "@/lib/types";

type QuickAddButtonProps = {
  projects: Project[];
  profiles: Profile[];
};

export function QuickAddButton({ projects, profiles }: QuickAddButtonProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (e.key.toLowerCase() === "n" && !isTyping && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-20 flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-4 py-3 text-sm font-medium text-[var(--color-accent-foreground)] shadow-lg transition-colors hover:bg-[var(--color-accent-hover)]"
        title="Nova tarefa (atalho: N)"
      >
        <Plus size={18} />
        <span className="hidden sm:inline">Nova tarefa</span>
      </button>

      <TaskFormModal
        open={open}
        onClose={() => setOpen(false)}
        projects={projects}
        profiles={profiles}
      />
    </>
  );
}

"use client";

import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import {
  completeRoutineToday,
  createRoutine,
  deleteRoutine,
  uncompleteRoutineToday,
} from "@/lib/actions/routines";
import { initials } from "@/lib/format";
import type { DailyRoutineWithStatus, Profile } from "@/lib/types";

type DailyRoutineColumnProps = {
  routines: DailyRoutineWithStatus[];
  profiles: Profile[];
};

export function DailyRoutineColumn({ routines, profiles }: DailyRoutineColumnProps) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAssignee, setNewAssignee] = useState<string>("");
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const titleInputRef = useRef<HTMLInputElement>(null);

  function isDone(routine: DailyRoutineWithStatus) {
    return overrides[routine.id] ?? routine.completedToday;
  }

  async function handleToggle(routine: DailyRoutineWithStatus) {
    const next = !isDone(routine);
    setOverrides((o) => ({ ...o, [routine.id]: next }));
    try {
      if (next) await completeRoutineToday(routine.id);
      else await uncompleteRoutineToday(routine.id);
      router.refresh();
    } catch {
      setOverrides((o) => ({ ...o, [routine.id]: !next }));
    }
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;

    setNewTitle("");
    titleInputRef.current?.focus();

    try {
      await createRoutine(title, newAssignee || null, routines.length);
      router.refresh();
    } catch {
      // Mantém o formulário aberto para o usuário tentar de novo.
    }
  }

  function handleTitleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setAdding(false);
      setNewTitle("");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Remover esta rotina definitivamente?")) return;
    try {
      await deleteRoutine(id);
      router.refresh();
    } catch {
      // Ignora falha pontual; o usuário pode tentar novamente.
    }
  }

  return (
    <div className="flex h-[70vh] w-72 shrink-0 flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] sm:w-80">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[var(--color-text)]">Rotina Diária</span>
          <span className="rounded-full bg-[var(--color-bg-hover)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--color-text-muted)]">
            {routines.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setAdding(true);
            requestAnimationFrame(() => titleInputRef.current?.focus());
          }}
          className="flex size-6 items-center justify-center rounded-md text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]"
          aria-label="Nova rotina"
          title="Nova rotina"
        >
          <Plus size={15} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-2.5">
        {adding && (
          <form
            onSubmit={handleAdd}
            className="mb-1 flex flex-col gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-2"
          >
            <input
              ref={titleInputRef}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={handleTitleKeyDown}
              placeholder="Nome da rotina..."
              className="w-full rounded-md border border-transparent bg-transparent px-1 py-1 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-border)] focus:bg-[var(--color-bg)] focus:px-2"
            />
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-[var(--color-text-faint)]">Responsável:</span>
              {profiles.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setNewAssignee(p.id)}
                  title={p.full_name}
                  className={`flex size-5 items-center justify-center rounded-full text-[10px] font-semibold transition-colors ${
                    newAssignee === p.id
                      ? "bg-[var(--color-accent)] text-[var(--color-accent-foreground)]"
                      : "bg-[var(--color-bg-hover)] text-[var(--color-text-muted)]"
                  }`}
                >
                  {initials(p.full_name)}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setNewAssignee("")}
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                  newAssignee === ""
                    ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                    : "text-[var(--color-text-faint)] hover:bg-[var(--color-bg-hover)]"
                }`}
              >
                Nenhum
              </button>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setAdding(false);
                  setNewTitle("");
                }}
                className="rounded-md px-2 py-1 text-xs font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-md bg-[var(--color-accent)] px-2.5 py-1 text-xs font-medium text-[var(--color-accent-foreground)] hover:bg-[var(--color-accent-hover)]"
              >
                Adicionar
              </button>
            </div>
          </form>
        )}

        {routines.map((routine) => {
          const done = isDone(routine);
          return (
            <div
              key={routine.id}
              className="group flex items-center gap-2.5 rounded-md px-1 py-2 hover:bg-[var(--color-bg-hover)]"
            >
              <button
                type="button"
                onClick={() => handleToggle(routine)}
                aria-label={done ? "Marcar como não feita hoje" : "Marcar como feita hoje"}
                className={`flex size-[16px] shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  done
                    ? "border-[var(--color-success)] bg-[var(--color-success)]"
                    : "border-[var(--color-text-faint)] hover:border-[var(--color-accent)]"
                }`}
              >
                {done && (
                  <svg viewBox="0 0 16 16" fill="none" className="size-2">
                    <path
                      d="M3 8.5L6.2 11.5L13 4.5"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>

              <span
                className={`flex-1 text-sm text-[var(--color-text)] ${
                  done ? "text-[var(--color-text-faint)] line-through" : ""
                }`}
              >
                {routine.title}
              </span>

              {routine.assignee && (
                <span
                  title={routine.assignee.full_name}
                  className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[10px] font-semibold text-[var(--color-accent)]"
                >
                  {initials(routine.assignee.full_name)}
                </span>
              )}

              <button
                type="button"
                onClick={() => handleDelete(routine.id)}
                aria-label="Remover rotina"
                className="flex size-6 shrink-0 items-center justify-center rounded-md text-[var(--color-text-faint)] opacity-0 hover:bg-[var(--color-urgent-soft)] hover:text-[var(--color-urgent)] group-hover:opacity-100"
              >
                <X size={13} />
              </button>
            </div>
          );
        })}

        {routines.length === 0 && !adding && (
          <p className="px-1 py-6 text-center text-xs text-[var(--color-text-faint)]">
            Nenhuma rotina cadastrada.
          </p>
        )}
      </div>
    </div>
  );
}

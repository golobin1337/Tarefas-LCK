import type { TaskPriority } from "@/lib/types";

export const PRIORITY_ORDER: TaskPriority[] = ["baixa", "media", "alta"];

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};

export const PRIORITY_COLOR_VAR: Record<TaskPriority, string> = {
  baixa: "var(--color-success)",
  media: "var(--color-warning)",
  alta: "var(--color-urgent)",
};

export const PRIORITY_SOFT_VAR: Record<TaskPriority, string> = {
  baixa: "var(--color-success-soft)",
  media: "var(--color-warning-soft)",
  alta: "var(--color-urgent-soft)",
};

import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/dates";
import type { DailyRoutineWithStatus, Profile, Project, TaskWithRelations } from "@/lib/types";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfiles(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getTasks(): Promise<TaskWithRelations[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select(
      "*, project:projects(*), assignee:profiles!tasks_assigned_to_fkey(*), checklist:task_checklist_items(*)"
    )
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .order("position", { ascending: true, referencedTable: "task_checklist_items" });

  if (error) throw new Error(error.message);
  return (data as unknown as TaskWithRelations[]) ?? [];
}

export async function getDailyRoutines(): Promise<DailyRoutineWithStatus[]> {
  const supabase = await createClient();
  const today = todayISO();

  const [routinesRes, completionsRes] = await Promise.all([
    supabase
      .from("daily_routines")
      .select("*, assignee:profiles(*)")
      .eq("is_active", true)
      .order("position", { ascending: true }),
    supabase.from("daily_routine_completions").select("routine_id").eq("completion_date", today),
  ]);

  if (routinesRes.error) throw new Error(routinesRes.error.message);
  if (completionsRes.error) throw new Error(completionsRes.error.message);

  const completedIds = new Set((completionsRes.data ?? []).map((c) => c.routine_id));

  return (routinesRes.data ?? []).map((routine) => ({
    ...routine,
    completedToday: completedIds.has(routine.id),
  })) as unknown as DailyRoutineWithStatus[];
}

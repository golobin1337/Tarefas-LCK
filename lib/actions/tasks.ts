"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TaskStatus } from "@/lib/types";

export type TaskInput = {
  title: string;
  description?: string | null;
  due_date?: string | null;
  project_id?: string | null;
  assigned_to?: string | null;
  is_urgent?: boolean;
  status?: TaskStatus;
};

async function requireUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");
  return { supabase, userId: user.id };
}

function revalidateTaskViews() {
  revalidatePath("/", "layout");
}

export async function createTask(input: TaskInput) {
  const { supabase, userId } = await requireUserId();
  const status = input.status ?? "todo";

  const { error } = await supabase.from("tasks").insert({
    title: input.title.trim(),
    description: input.description?.trim() || null,
    due_date: input.due_date || null,
    project_id: input.project_id || null,
    assigned_to: input.assigned_to || null,
    is_urgent: input.is_urgent ?? false,
    created_by: userId,
    status,
    completed_at: status === "done" ? new Date().toISOString() : null,
  });

  if (error) throw new Error(error.message);
  revalidateTaskViews();
}

export async function updateTask(id: string, input: TaskInput) {
  const { supabase } = await requireUserId();

  const { error } = await supabase
    .from("tasks")
    .update({
      title: input.title.trim(),
      description: input.description?.trim() || null,
      due_date: input.due_date || null,
      project_id: input.project_id || null,
      assigned_to: input.assigned_to || null,
      is_urgent: input.is_urgent ?? false,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateTaskViews();
}

export async function setTaskStatus(id: string, status: TaskStatus) {
  const { supabase } = await requireUserId();

  const { error } = await supabase
    .from("tasks")
    .update({
      status,
      completed_at: status === "done" ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateTaskViews();
}

export async function deleteTask(id: string) {
  const { supabase } = await requireUserId();

  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidateTaskViews();
}

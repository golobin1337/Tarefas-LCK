"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ChecklistItem } from "@/lib/types";

async function requireClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");
  return supabase;
}

function revalidate() {
  revalidatePath("/", "layout");
}

export async function addChecklistItem(
  taskId: string,
  title: string,
  position: number
): Promise<{ item: ChecklistItem | null; error: string | null }> {
  const supabase = await requireClient();

  const { data, error } = await supabase
    .from("task_checklist_items")
    .insert({ task_id: taskId, title: title.trim(), position })
    .select()
    .single();

  if (error) return { item: null, error: error.message };
  revalidate();
  return { item: data, error: null };
}

export async function toggleChecklistItem(id: string, isDone: boolean) {
  const supabase = await requireClient();

  const { error } = await supabase
    .from("task_checklist_items")
    .update({ is_done: isDone })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidate();
}

export async function deleteChecklistItem(id: string) {
  const supabase = await requireClient();

  const { error } = await supabase.from("task_checklist_items").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidate();
}

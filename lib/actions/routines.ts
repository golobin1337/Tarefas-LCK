"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/dates";

async function requireClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");
  return { supabase, userId: user.id };
}

function revalidate() {
  revalidatePath("/", "layout");
}

export async function createRoutine(title: string, assignedTo: string | null, position: number) {
  const { supabase } = await requireClient();

  const { error } = await supabase.from("daily_routines").insert({
    title: title.trim(),
    assigned_to: assignedTo,
    position,
  });

  if (error) throw new Error(error.message);
  revalidate();
}

export async function deleteRoutine(id: string) {
  const { supabase } = await requireClient();

  const { error } = await supabase.from("daily_routines").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidate();
}

export async function completeRoutineToday(routineId: string) {
  const { supabase, userId } = await requireClient();

  const { error } = await supabase.from("daily_routine_completions").insert({
    routine_id: routineId,
    completion_date: todayISO(),
    completed_by: userId,
  });

  if (error) throw new Error(error.message);
  revalidate();
}

export async function uncompleteRoutineToday(routineId: string) {
  const { supabase } = await requireClient();

  const { error } = await supabase
    .from("daily_routine_completions")
    .delete()
    .eq("routine_id", routineId)
    .eq("completion_date", todayISO());

  if (error) throw new Error(error.message);
  revalidate();
}

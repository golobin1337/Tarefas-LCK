"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProjectInput = {
  name: string;
  color: string;
};

export async function createProject(input: ProjectInput) {
  const supabase = await createClient();

  const { error } = await supabase.from("projects").insert({
    name: input.name.trim(),
    color: input.color,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function updateProject(id: string, input: ProjectInput) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("projects")
    .update({ name: input.name.trim(), color: input.color })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function deleteProject(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

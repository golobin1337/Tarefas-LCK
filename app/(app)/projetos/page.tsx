import { ProjetosView } from "@/components/tasks/views/projetos-view";
import { getProjects, getTasks } from "@/lib/queries";

export default async function ProjetosPage() {
  const [projects, tasks] = await Promise.all([getProjects(), getTasks()]);

  return <ProjetosView projects={projects} tasks={tasks} />;
}

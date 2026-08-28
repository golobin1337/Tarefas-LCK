export type TaskStatus = "todo" | "doing" | "done";

export type Profile = {
  id: string;
  full_name: string;
  created_at: string;
};

export type Project = {
  id: string;
  name: string;
  color: string;
  created_at: string;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  is_urgent: boolean;
  due_date: string | null;
  project_id: string | null;
  assigned_to: string | null;
  created_by: string;
  created_at: string;
  completed_at: string | null;
};

export type TaskWithRelations = Task & {
  project: Project | null;
  assignee: Profile | null;
};

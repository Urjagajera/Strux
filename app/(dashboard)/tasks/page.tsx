import { getTasks } from "@/actions/tasks";
import TaskList from "@/components/tasks/TaskList";
import NewTaskButton from "@/components/tasks/NewTaskButton";

export default async function TasksPage() {
  const tasks = await getTasks();

  return (
    <div className="p-6 max-w-5xl mx-auto text-[var(--text)]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-lg font-black tracking-tight mb-1 text-[var(--text)]">Active Tasks</h1>
          <p className="text-xs text-[var(--text-muted)] font-medium">Manage your work and projects with Strux Professional.</p>
        </div>
        <NewTaskButton />
      </div>

      <TaskList tasks={tasks} />
    </div>
  );
}

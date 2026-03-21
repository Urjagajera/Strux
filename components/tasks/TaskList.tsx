"use client";

import { Task, upsertTask, deleteTask } from "@/actions/tasks";
import { CheckCircle2, Circle, Trash2, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TaskList({ tasks }: { tasks: Task[] }) {
  const toggleStatus = async (task: Task) => {
    const newStatus = task.status === "done" ? "todo" : "done";
    await upsertTask({ ...task, status: newStatus });
  };

  return (
    <div className="space-y-3">
      {tasks.length === 0 && (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed">
          <p className="text-muted-foreground">No tasks found. Try asking Strux Professional to plan something!</p>
        </div>
      )}
      {tasks.map((task) => (
        <div
          key={task.id}
          className={cn(
            "group flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl border shadow-sm transition-all hover:shadow-md",
            task.status === "done" && "opacity-60"
          )}
        >
          <div className="flex items-center gap-4">
            <button onClick={() => toggleStatus(task)} className="transition-transform active:scale-90">
              {task.status === "done" ? (
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              ) : (
                <Circle className="h-6 w-6 text-slate-300" />
              )}
            </button>
            <div>
              <h3 className={cn("font-semibold", task.status === "done" && "line-through")}>
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-muted-foreground line-clamp-1">{task.description}</p>
              )}
              <div className="flex items-center gap-3 mt-1">
                {task.priority === "high" || task.priority === "urgent" ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-500">
                    <AlertTriangle className="h-3 w-3" /> {task.priority}
                  </span>
                ) : null}
                {task.due_date && (
                  <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
                    <Clock className="h-3 w-3" /> {new Date(task.due_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => deleteTask(task.id)}
            className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-all"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      ))}
    </div>
  );
}

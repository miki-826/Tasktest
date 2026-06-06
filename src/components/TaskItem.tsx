"use client";

import { deleteTask, updateTask } from "@/lib/store";
import type { Task } from "@/lib/types";
import { cn, formatDate, isOverdue } from "@/lib/utils";
import { PriorityBadge, StatusBadge } from "./badges";

export function TaskItem({ task, onEdit }: { task: Task; onEdit?: (task: Task) => void }) {
  const done = task.status === "done";
  const overdue = !done && isOverdue(task.dueDate);

  function toggle() {
    updateTask(task.id, { status: done ? "todo" : "done" });
  }

  return (
    <div className="flex items-start gap-3 border-b border-neutral-200 py-3 last:border-0">
      <button
        onClick={toggle}
        aria-label="完了切り替え"
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
          done ? "border-black bg-black text-white" : "border-neutral-400 hover:border-black",
        )}
      >
        {done && (
          <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M5 12l5 5L20 6" />
          </svg>
        )}
      </button>

      <div className="min-w-0 flex-1 cursor-pointer" onClick={() => onEdit?.(task)}>
        <div className="flex items-center gap-2">
          <span className={cn("truncate text-sm font-medium", done && "text-neutral-400 line-through")}>{task.title}</span>
          <PriorityBadge priority={task.priority} />
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
          <span className={cn("font-mono", overdue ? "rounded bg-black px-1.5 py-0.5 text-white" : "text-neutral-500")}>
            {overdue ? "期限切れ " : "期限 "}
            {formatDate(task.dueDate)}
          </span>
          <StatusBadge status={task.status} />
          {task.tags.map((t) => (
            <span key={t} className="rounded-full border border-neutral-300 px-2 py-0.5 text-neutral-600">
              #{t}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={() => {
          if (confirm(`「${task.title}」を削除しますか？`)) deleteTask(task.id);
        }}
        aria-label="削除"
        className="mt-0.5 shrink-0 text-neutral-300 hover:text-black"
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
        </svg>
      </button>
    </div>
  );
}

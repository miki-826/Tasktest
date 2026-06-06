"use client";

import { deleteTask, updateTask } from "@/lib/store";
import type { Task } from "@/lib/types";
import { cn, formatDate, isOverdue } from "@/lib/utils";
import { PriorityBadge, StatusBadge } from "./badges";

export function TaskItem({ task, onEdit }: { task: Task; onEdit?: (task: Task) => void }) {
  const done = task.status === "done";
  const overdue = !done && isOverdue(task.dueDate);

  function edit() {
    onEdit?.(task);
  }

  function toggle() {
    updateTask(task.id, { status: done ? "todo" : "done" });
  }

  return (
    <div
      role={onEdit ? "button" : undefined}
      tabIndex={onEdit ? 0 : undefined}
      onClick={edit}
      onKeyDown={(event) => {
        if (!onEdit) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          edit();
        }
      }}
      className={cn(
        "group relative flex items-start gap-3 rounded-lg border-l-2 py-3 pl-3 pr-2 text-left transition-colors hover:bg-neutral-50",
        onEdit && "cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
      )}
      style={{ borderLeftColor: task.color ?? "transparent" }}
    >
      <button
        onClick={(event) => {
          event.stopPropagation();
          toggle();
        }}
        aria-label="完了・未完了を切り替え"
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-all active:scale-90",
          done ? "border-black bg-black text-white" : "border-neutral-400 hover:border-black",
        )}
      >
        {done && (
          <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M5 12l5 5L20 6" />
          </svg>
        )}
      </button>

      <div className="min-w-0 flex-1" title={onEdit ? "クリックで編集" : undefined}>
        <div className="flex items-center gap-2">
          {task.color && <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: task.color }} />}
          <span className={cn("truncate text-sm font-medium text-neutral-900", done && "text-neutral-400 line-through")}>
            {task.title}
          </span>
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
        {task.description && <p className="mt-1 line-clamp-2 text-xs leading-5 text-neutral-500">{task.description}</p>}
      </div>

      {onEdit && (
        <button
          onClick={(event) => {
            event.stopPropagation();
            edit();
          }}
          aria-label="タスクを編集"
          className="mt-0.5 shrink-0 rounded-full border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-500 opacity-100 transition-all hover:border-black hover:text-black md:opacity-0 md:group-hover:opacity-100"
        >
          編集
        </button>
      )}

      <button
        onClick={(event) => {
          event.stopPropagation();
          if (confirm(`「${task.title}」を削除しますか？`)) deleteTask(task.id);
        }}
        aria-label="削除"
        className="mt-0.5 shrink-0 text-neutral-300 opacity-0 transition-all hover:text-black group-hover:opacity-100"
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
        </svg>
      </button>
    </div>
  );
}

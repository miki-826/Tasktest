"use client";

import type { Task } from "@/lib/types";
import { cn, toDateStr, todayStr } from "@/lib/utils";

const WEEKDAYS = ["月", "火", "水", "木", "金", "土", "日"];

interface Props {
  year: number;
  month: number; // 0-indexed
  tasks: Task[];
  selected?: string | null;
  onSelect?: (dateStr: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
  compact?: boolean;
}

export function MonthCalendar({ year, month, tasks, selected, onSelect, onPrev, onNext, compact }: Props) {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7; // Mondayを0に
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = todayStr();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const tasksByDate = new Map<string, Task[]>();
  for (const t of tasks) {
    if (!t.dueDate) continue;
    const arr = tasksByDate.get(t.dueDate) ?? [];
    arr.push(t);
    tasksByDate.set(t.dueDate, arr);
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold">
          {year} {first.toLocaleString("en-US", { month: "long" })}
        </h2>
        <div className="flex gap-1">
          <NavBtn onClick={onPrev} label="‹" />
          <NavBtn onClick={onNext} label="›" />
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-neutral-200 bg-neutral-200">
        {WEEKDAYS.map((w) => (
          <div key={w} className="bg-neutral-50 py-1.5 text-center text-xs text-neutral-500">
            {w}
          </div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={i} className="bg-white" />;
          const dateStr = toDateStr(new Date(year, month, d));
          const dayTasks = tasksByDate.get(dateStr) ?? [];
          const isToday = dateStr === today;
          const isSelected = dateStr === selected;
          return (
            <button
              key={i}
              onClick={() => onSelect?.(dateStr)}
              className={cn(
                "bg-white text-left align-top transition-colors hover:bg-neutral-50",
                compact ? "h-9 p-1" : "min-h-[88px] p-1.5",
                isSelected && "ring-2 ring-inset ring-black",
              )}
            >
              <span
                className={cn(
                  "inline-flex size-6 items-center justify-center rounded-full font-mono text-xs",
                  isToday && "bg-black text-white",
                )}
              >
                {d}
              </span>
              {!compact && (
                <div className="mt-1 space-y-0.5">
                  {dayTasks.slice(0, 3).map((t) => (
                    <div
                      key={t.id}
                      className={cn(
                        "truncate rounded px-1 py-0.5 text-[10px]",
                        t.status === "done"
                          ? "bg-neutral-100 text-neutral-400 line-through"
                          : t.dueDate! < today
                            ? "bg-black text-white"
                            : "bg-neutral-800 text-white",
                      )}
                    >
                      {t.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && <div className="text-[10px] text-neutral-400">+{dayTasks.length - 3}</div>}
                </div>
              )}
              {compact && dayTasks.length > 0 && <div className="mx-auto mt-0.5 size-1 rounded-full bg-black" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NavBtn({ onClick, label }: { onClick?: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex size-8 items-center justify-center rounded-md border border-neutral-300 text-neutral-600 hover:bg-neutral-100"
    >
      {label}
    </button>
  );
}

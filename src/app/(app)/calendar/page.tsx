"use client";

import { useMemo, useState } from "react";
import { useTasks } from "@/lib/store";
import type { Task } from "@/lib/types";
import { formatDate, todayStr } from "@/lib/utils";
import { Button, Card, PageHeader } from "@/components/ui";
import { MonthCalendar } from "@/components/MonthCalendar";
import { TaskItem } from "@/components/TaskItem";
import { TaskForm } from "@/components/TaskForm";

export default function CalendarPage() {
  const tasks = useTasks();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState<string>(todayStr());
  const [addForDate, setAddForDate] = useState<string | null>(null);
  const [editing, setEditing] = useState<Task | null>(null);

  function prev() {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else setMonth(month - 1);
  }
  function next() {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else setMonth(month + 1);
  }

  const dayTasks = useMemo(() => tasks.filter((t) => t.dueDate === selected), [tasks, selected]);

  return (
    <>
      <PageHeader title="Calendar" subtitle="タスクの期日をカレンダーで確認" />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <MonthCalendar
              year={year}
              month={month}
              tasks={tasks}
              selected={selected}
              onSelect={setSelected}
              onPrev={prev}
              onNext={next}
            />
          </Card>
        </div>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading font-bold">{formatDate(selected)}</h2>
            <Button variant="secondary" onClick={() => setAddForDate(selected)} className="px-3 py-1 text-xs">
              + 追加
            </Button>
          </div>
          {dayTasks.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-400">この日のタスクはありません</p>
          ) : (
            dayTasks.map((t) => <TaskItem key={t.id} task={t} onEdit={setEditing} />)
          )}
        </Card>
      </div>

      <TaskForm open={!!addForDate} presetDueDate={addForDate} onClose={() => setAddForDate(null)} />
      <TaskForm open={!!editing} task={editing} onClose={() => setEditing(null)} />
    </>
  );
}

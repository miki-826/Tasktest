"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStudyLogs, useTasks } from "@/lib/store";
import type { Task } from "@/lib/types";
import { formatMinutes, isThisWeek, isOverdue, todayStr } from "@/lib/utils";
import { Card, PageHeader, StatCard } from "@/components/ui";
import { TaskItem } from "@/components/TaskItem";
import { TaskForm } from "@/components/TaskForm";
import { MonthCalendar } from "@/components/MonthCalendar";

export default function DashboardPage() {
  const tasks = useTasks();
  const logs = useStudyLogs();
  const router = useRouter();
  const [editing, setEditing] = useState<Task | null>(null);
  const today = todayStr();
  const now = new Date();

  const todayTasks = useMemo(() => tasks.filter((t) => t.dueDate === today && t.status !== "done"), [tasks, today]);
  const overdueTasks = useMemo(() => tasks.filter((t) => t.status !== "done" && isOverdue(t.dueDate)), [tasks]);
  const inProgress = useMemo(() => tasks.filter((t) => t.status === "in_progress"), [tasks]);

  const todayMinutes = logs.filter((l) => l.studiedAt === today).reduce((s, l) => s + l.durationMinutes, 0);
  const weekMinutes = logs.filter((l) => isThisWeek(l.studiedAt)).reduce((s, l) => s + l.durationMinutes, 0);

  const recentLogs = [...logs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  return (
    <>
      <PageHeader title="Dashboard" subtitle="今日の集中ポイントを確認しましょう" />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Today Tasks" value={todayTasks.length} sub="今日が期限のタスク" />
        <StatCard label="Study Today" value={todayMinutes} sub="分 / 本日の学習時間" />
        <StatCard label="Overdue" value={overdueTasks.length} sub="期限切れタスク" />
        <StatCard label="In Progress" value={inProgress.length} sub="進行中タスク" />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-heading font-bold">今日のタスク</h2>
              <Link href="/tasks" className="text-xs text-neutral-500 hover:text-black">
                すべて見る →
              </Link>
            </div>
            {todayTasks.length === 0 && overdueTasks.length === 0 ? (
              <p className="py-6 text-center text-sm text-neutral-400">今日のタスクはありません</p>
            ) : (
              <>
                {overdueTasks.map((t) => (
                  <TaskItem key={t.id} task={t} onEdit={setEditing} />
                ))}
                {todayTasks.map((t) => (
                  <TaskItem key={t.id} task={t} onEdit={setEditing} />
                ))}
              </>
            )}
          </Card>
        </div>

        <Card>
          <h2 className="font-heading mb-3 font-bold">ミニカレンダー</h2>
          <MonthCalendar
            year={now.getFullYear()}
            month={now.getMonth()}
            tasks={tasks}
            compact
            onSelect={() => router.push("/calendar")}
          />
          <div className="mt-4 rounded-lg bg-neutral-50 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">今週の学習</span>
              <span className="font-mono font-semibold">{formatMinutes(weekMinutes)}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-3">
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-heading font-bold">最近の学習ログ</h2>
            <Link href="/study" className="text-xs text-neutral-500 hover:text-black">
              すべて見る →
            </Link>
          </div>
          {recentLogs.length === 0 ? (
            <p className="py-6 text-center text-sm text-neutral-400">学習ログはまだありません</p>
          ) : (
            recentLogs.map((l) => (
              <div key={l.id} className="flex items-center justify-between border-b border-neutral-200 py-2.5 text-sm last:border-0">
                <span className="truncate">{l.title}</span>
                <span className="ml-2 shrink-0 font-mono text-neutral-600">{formatMinutes(l.durationMinutes)}</span>
              </div>
            ))
          )}
        </Card>
      </div>

      <TaskForm open={!!editing} task={editing} onClose={() => setEditing(null)} />
    </>
  );
}

"use client";

import { useMemo, useState } from "react";
import { addStudyLog, deleteStudyLog, useStudyLogs, useTasks } from "@/lib/store";
import { formatDate, formatMinutes, isThisMonth, isThisWeek, startOfWeek, toDateStr, todayStr } from "@/lib/utils";
import { Button, Card, Field, Input, Modal, PageHeader, Select, StatCard, Textarea } from "@/components/ui";

export default function StudyPage() {
  const logs = useStudyLogs();
  const tasks = useTasks();
  const [showAdd, setShowAdd] = useState(false);
  const today = todayStr();

  const todayMin = logs.filter((l) => l.studiedAt === today).reduce((s, l) => s + l.durationMinutes, 0);
  const weekMin = logs.filter((l) => isThisWeek(l.studiedAt)).reduce((s, l) => s + l.durationMinutes, 0);
  const monthMin = logs.filter((l) => isThisMonth(l.studiedAt)).reduce((s, l) => s + l.durationMinutes, 0);

  const weekBars = useMemo(() => {
    const start = startOfWeek(new Date());
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return labels.map((label, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const key = toDateStr(d);
      const min = logs.filter((l) => l.studiedAt === key).reduce((s, l) => s + l.durationMinutes, 0);
      return { label, min };
    });
  }, [logs]);
  const maxMin = Math.max(60, ...weekBars.map((b) => b.min));

  const sortedLogs = [...logs].sort((a, b) => b.studiedAt.localeCompare(a.studiedAt) || b.createdAt.localeCompare(a.createdAt));
  const taskTitle = (id: string | null) => tasks.find((t) => t.id === id)?.title;

  return (
    <>
      <PageHeader title="Study Log" subtitle="学習時間・作業時間を記録" action={<Button onClick={() => setShowAdd(true)}>+ Add Log</Button>} />

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Today" value={todayMin} sub="分" />
        <StatCard label="This Week" value={(weekMin / 60).toFixed(1)} sub="時間" />
        <StatCard label="This Month" value={(monthMin / 60).toFixed(1)} sub="時間" />
      </div>

      <Card className="mt-3">
        <h2 className="font-heading mb-3 font-bold">今週の学習時間</h2>
        <div className="space-y-2">
          {weekBars.map((b) => (
            <div key={b.label} className="flex items-center gap-3 text-sm">
              <span className="w-10 shrink-0 font-mono text-xs text-neutral-500">{b.label}</span>
              <div className="h-4 flex-1 overflow-hidden rounded bg-neutral-100">
                <div className="h-full rounded bg-black transition-all" style={{ width: `${(b.min / maxMin) * 100}%` }} />
              </div>
              <span className="w-12 shrink-0 text-right font-mono text-xs text-neutral-600">{b.min}m</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-3">
        <h2 className="font-heading mb-2 font-bold">学習ログ一覧</h2>
        {sortedLogs.length === 0 ? (
          <p className="py-8 text-center text-sm text-neutral-400">学習ログはまだありません</p>
        ) : (
          sortedLogs.map((l) => (
            <div key={l.id} className="group flex items-start gap-3 border-b border-neutral-200 py-3 last:border-0">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-neutral-900">{l.title}</span>
                  <span className="font-mono text-xs text-neutral-600">{formatMinutes(l.durationMinutes)}</span>
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                  <span className="font-mono">{formatDate(l.studiedAt)}</span>
                  {taskTitle(l.taskId) && <span className="rounded-full border border-neutral-300 px-2 py-0.5">{taskTitle(l.taskId)}</span>}
                  {l.memo && <span className="truncate">{l.memo}</span>}
                </div>
              </div>
              <button
                onClick={() => deleteStudyLog(l.id)}
                aria-label="削除"
                className="mt-0.5 shrink-0 text-neutral-300 opacity-0 transition-all hover:text-black group-hover:opacity-100"
              >
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                </svg>
              </button>
            </div>
          ))
        )}
      </Card>

      <StudyForm open={showAdd} onClose={() => setShowAdd(false)} />
    </>
  );
}

function StudyForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const tasks = useTasks();
  const [title, setTitle] = useState("");
  const [taskId, setTaskId] = useState("");
  const [studiedAt, setStudiedAt] = useState(todayStr());
  const [duration, setDuration] = useState("30");
  const [memo, setMemo] = useState("");

  const [saving, setSaving] = useState(false);

  async function submit() {
    const min = parseInt(duration, 10);
    if (!title.trim() || !min) return;
    setSaving(true);
    try {
      await addStudyLog({ title: title.trim(), taskId: taskId || null, studiedAt, durationMinutes: min, memo: memo.trim() });
      setTitle("");
      setTaskId("");
      setDuration("30");
      setMemo("");
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="font-heading mb-5 text-xl font-bold text-neutral-900">学習ログを追加</h2>
      <div className="flex flex-col gap-4">
        <Field label="学習内容">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="LPIC 101 問題集" autoFocus />
        </Field>
        <Field label="対象タスク">
          <Select value={taskId} onChange={(e) => setTaskId(e.target.value)}>
            <option value="">（紐づけなし）</option>
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="学習日">
            <Input type="date" value={studiedAt} onChange={(e) => setStudiedAt(e.target.value)} />
          </Field>
          <Field label="学習時間（分）">
            <Input type="number" min={1} value={duration} onChange={(e) => setDuration(e.target.value)} />
          </Field>
        </div>
        <Field label="メモ">
          <Textarea value={memo} onChange={(e) => setMemo(e.target.value)} rows={2} placeholder="間違えた問題を復習" />
        </Field>
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={submit} disabled={!title.trim() || !parseInt(duration, 10) || saving}>
            {saving ? "..." : "Save Log"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

"use client";

import { useEffect, useState } from "react";
import { addTask, updateTask } from "@/lib/store";
import { PRIORITY_LABEL, STATUS_LABEL, TASK_COLORS, type Priority, type Status, type Task } from "@/lib/types";
import { Button, Field, Input, Modal, Tag, Textarea } from "./ui";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  task?: Task | null;
  presetDueDate?: string | null;
}

export function TaskForm({ open, onClose, task, presetDueDate }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>("mid");
  const [status, setStatus] = useState<Status>("todo");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [color, setColor] = useState<string | null>(null);
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(() => {
      setTitle(task?.title ?? "");
      setDescription(task?.description ?? "");
      setDueDate(task?.dueDate ?? presetDueDate ?? "");
      setPriority(task?.priority ?? "mid");
      setStatus(task?.status ?? "todo");
      setTags(task?.tags ?? []);
      setColor(task?.color ?? null);
      setNotifyEnabled(task?.notifyEnabled ?? false);
      setTagInput("");
      setSaving(false);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [open, task, presetDueDate]);

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  }

  async function submit() {
    if (!title.trim()) return;
    const data = {
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate || null,
      priority,
      status,
      tags,
      color,
      notifyEnabled,
      notifyBeforeMinutes: task?.notifyBeforeMinutes ?? 1440,
    };
    setSaving(true);
    try {
      if (task) {
        await updateTask(task.id, data);
      } else {
        await addTask(data);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="mb-5">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.3em] text-neutral-500">{task ? "Edit task" : "New task"}</p>
        <h2 className="font-heading text-2xl font-semibold tracking-[-0.04em] text-neutral-950">
          {task ? "タスクの内容を変更" : "新しいタスクを追加"}
        </h2>
        {task && <p className="mt-1 text-sm text-neutral-500">タイトル、内容、期限、状態をここでまとめて編集できます。</p>}
      </div>

      <div className="flex flex-col gap-4">
        <Field label="タイトル">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例: LPICの勉強" />
        </Field>
        <Field label="内容">
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="例: 問題集を20問解く" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <Field label="期限">
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </Field>
          <Field label="カラー">
            <div className="flex flex-wrap items-center gap-2">
              {TASK_COLORS.map((c) => {
                const selected = color === c.value;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setColor(c.value)}
                    title={c.name}
                    aria-label={`カラー: ${c.name}`}
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full border transition-all hover:scale-110",
                      selected ? "ring-2 ring-black ring-offset-2 ring-offset-white" : "",
                      c.value ? "border-transparent" : "border-neutral-300",
                    )}
                    style={c.value ? { backgroundColor: c.value } : undefined}
                  >
                    {!c.value && (
                      <svg viewBox="0 0 24 24" className="size-4 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 19L19 5" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>
        <Field label="タグ">
          <div className="flex flex-wrap items-center gap-2">
            {tags.map((t) => (
              <Tag key={t} onClick={() => setTags(tags.filter((x) => x !== t))}>
                #{t} ×
              </Tag>
            ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="タグを追加 + Enter"
              className="min-w-[120px] flex-1 rounded-2xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-black"
            />
          </div>
        </Field>
        <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
          <Field label="優先度">
            <div className="flex gap-2">
              {(Object.keys(PRIORITY_LABEL) as Priority[]).map((p) => (
                <Choice key={p} active={priority === p} onClick={() => setPriority(p)}>
                  {PRIORITY_LABEL[p]}
                </Choice>
              ))}
            </div>
          </Field>
          <Field label="ステータス">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
                <Choice key={s} active={status === s} onClick={() => setStatus(s)}>
                  {STATUS_LABEL[s]}
                </Choice>
              ))}
            </div>
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input type="checkbox" checked={notifyEnabled} onChange={(e) => setNotifyEnabled(e.target.checked)} className="size-4 accent-black" />
          期限が近づいたらメール通知する（拡張機能予定）
        </label>
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={submit} disabled={!title.trim() || saving}>
            {saving ? "保存中..." : task ? "変更を保存" : "タスクを追加"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        active ? "border-black bg-black text-white" : "border-neutral-300 bg-white text-black hover:bg-neutral-100",
      )}
    >
      {children}
    </button>
  );
}

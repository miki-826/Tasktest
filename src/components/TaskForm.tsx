"use client";

import { useState } from "react";
import { addTask, updateTask } from "@/lib/store";
import { PRIORITY_LABEL, STATUS_LABEL, type Priority, type Status, type Task } from "@/lib/types";
import { Button, Field, Input, Modal, Tag, Textarea } from "./ui";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  task?: Task | null;
  presetDueDate?: string | null;
}

export function TaskForm({ open, onClose, task, presetDueDate }: Props) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [dueDate, setDueDate] = useState(task?.dueDate ?? presetDueDate ?? "");
  const [priority, setPriority] = useState<Priority>(task?.priority ?? "mid");
  const [status, setStatus] = useState<Status>(task?.status ?? "todo");
  const [tags, setTags] = useState<string[]>(task?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [notifyEnabled, setNotifyEnabled] = useState(task?.notifyEnabled ?? false);

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  }

  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!title.trim()) return;
    const data = {
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate || null,
      priority,
      status,
      tags,
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
      <h2 className="font-heading mb-5 text-xl font-bold">{task ? "Edit Task" : "New Task"}</h2>
      <div className="flex flex-col gap-4">
        <Field label="タイトル">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="LPICの勉強" autoFocus />
        </Field>
        <Field label="内容">
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="問題集を30問解く" />
        </Field>
        <Field label="期日">
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </Field>
        <Field label="タグ">
          <div className="flex flex-wrap items-center gap-2">
            {tags.map((t) => (
              <Tag key={t} onClick={() => setTags(tags.filter((x) => x !== t))}>
                #{t} ✕
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
              className="flex-1 min-w-[120px] rounded-md border border-neutral-300 px-2 py-1 text-sm outline-none focus:border-black"
            />
          </div>
        </Field>
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
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={notifyEnabled} onChange={(e) => setNotifyEnabled(e.target.checked)} className="size-4 accent-black" />
          期限が近づいたらメール通知する（拡張機能予定）
        </label>
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={submit} disabled={!title.trim() || saving}>
            {saving ? "..." : "Save Task"}
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
        "rounded-md border px-3 py-1.5 text-sm transition-colors",
        active ? "border-black bg-black text-white" : "border-neutral-300 bg-white text-black hover:bg-neutral-100",
      )}
    >
      {children}
    </button>
  );
}

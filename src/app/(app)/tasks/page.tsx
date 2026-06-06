"use client";

import { useMemo, useState } from "react";
import { useTasks } from "@/lib/store";
import { PRIORITY_LABEL, STATUS_LABEL, type Priority, type Status, type Task } from "@/lib/types";
import { Button, Card, Input, PageHeader, Select, Tag } from "@/components/ui";
import { TaskItem } from "@/components/TaskItem";
import { TaskForm } from "@/components/TaskForm";

type Sort = "due" | "priority" | "created";

const PRIORITY_RANK: Record<Priority, number> = { high: 0, mid: 1, low: 2 };

export default function TasksPage() {
  const tasks = useTasks();
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [sort, setSort] = useState<Sort>("due");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const tags = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => t.tags.forEach((x) => set.add(x)));
    return [...set];
  }, [tasks]);

  const filtered = useMemo(() => {
    let list = tasks.filter((t) => {
      if (query && !(t.title + t.description).toLowerCase().includes(query.toLowerCase())) return false;
      if (tagFilter && !t.tags.includes(tagFilter)) return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "due") return (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999");
      if (sort === "priority") return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      return b.createdAt.localeCompare(a.createdAt);
    });
    return list;
  }, [tasks, query, tagFilter, statusFilter, priorityFilter, sort]);

  return (
    <>
      <PageHeader
        title="Tasks"
        subtitle={`${filtered.length}件のタスク。タスクを選択すると内容を変更できます。`}
        action={<Button onClick={() => setShowAdd(true)}>+ New Task</Button>}
      />

      <Card className="mb-3">
        <div className="flex flex-col gap-3">
          <Input placeholder="タイトル・内容で検索..." value={query} onChange={(e) => setQuery(e.target.value)} />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as Status | "all")}>
              <option value="all">ステータス: すべて</option>
              {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </Select>
            <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as Priority | "all")}>
              <option value="all">優先度: すべて</option>
              {(Object.keys(PRIORITY_LABEL) as Priority[]).map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABEL[p]}
                </option>
              ))}
            </Select>
            <Select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="due">並び替え: 期限順</option>
              <option value="priority">並び替え: 優先度順</option>
              <option value="created">並び替え: 作成日順</option>
            </Select>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Tag active={tagFilter === null} onClick={() => setTagFilter(null)}>
                すべて
              </Tag>
              {tags.map((t) => (
                <Tag key={t} active={tagFilter === t} onClick={() => setTagFilter(tagFilter === t ? null : t)}>
                  #{t}
                </Tag>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card>
        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-neutral-400">該当するタスクがありません</p>
        ) : (
          filtered.map((t) => <TaskItem key={t.id} task={t} onEdit={setEditing} />)
        )}
      </Card>

      <TaskForm open={showAdd} onClose={() => setShowAdd(false)} />
      <TaskForm open={!!editing} task={editing} onClose={() => setEditing(null)} />
    </>
  );
}

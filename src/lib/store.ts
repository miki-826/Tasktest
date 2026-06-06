"use client";

import useSWR, { mutate } from "swr";
import { useEffect, useState } from "react";
import { createClient } from "./supabase/client";
import type { Settings, StudyLog, Task } from "./types";

type TaskRow = {
  id: string;
  title: string;
  description: string;
  due_date: string | null;
  status: Task["status"];
  priority: Task["priority"];
  tags: string[];
  color: string | null;
  notify_enabled: boolean;
  notify_before_minutes: number;
  created_at: string;
  updated_at: string;
};

type LogRow = {
  id: string;
  task_id: string | null;
  title: string;
  duration_minutes: number;
  studied_at: string;
  memo: string;
  created_at: string;
};

function rowToTask(r: TaskRow): Task {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    dueDate: r.due_date,
    status: r.status,
    priority: r.priority,
    tags: r.tags ?? [],
    color: r.color ?? null,
    notifyEnabled: r.notify_enabled,
    notifyBeforeMinutes: r.notify_before_minutes,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function taskToRow(t: Partial<Task>): Partial<TaskRow> {
  const row: Partial<TaskRow> = {};
  if (t.title !== undefined) row.title = t.title;
  if (t.description !== undefined) row.description = t.description;
  if (t.dueDate !== undefined) row.due_date = t.dueDate;
  if (t.status !== undefined) row.status = t.status;
  if (t.priority !== undefined) row.priority = t.priority;
  if (t.tags !== undefined) row.tags = t.tags;
  if (t.color !== undefined) row.color = t.color;
  if (t.notifyEnabled !== undefined) row.notify_enabled = t.notifyEnabled;
  if (t.notifyBeforeMinutes !== undefined) row.notify_before_minutes = t.notifyBeforeMinutes;
  return row;
}

function rowToLog(r: LogRow): StudyLog {
  return {
    id: r.id,
    taskId: r.task_id,
    title: r.title,
    durationMinutes: r.duration_minutes,
    studiedAt: r.studied_at,
    memo: r.memo,
    createdAt: r.created_at,
  };
}

const DEFAULT_SETTINGS: Settings = { notifyEnabled: true, notifyTiming: 1440 };

// --- Tasks ---
async function fetchTasks(): Promise<Task[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return (data as TaskRow[]).map(rowToTask);
}

export function useTasks(): Task[] {
  const { data } = useSWR("tasks", fetchTasks);
  return data ?? [];
}

export async function addTask(input: Omit<Task, "id" | "createdAt" | "updatedAt">) {
  const supabase = createClient();
  const { error } = await supabase.from("tasks").insert(taskToRow(input));
  if (error) throw error;
  mutate("tasks");
}

export async function updateTask(id: string, patch: Partial<Task>) {
  const supabase = createClient();
  const { error } = await supabase.from("tasks").update(taskToRow(patch)).eq("id", id);
  if (error) throw error;
  mutate("tasks");
}

export async function deleteTask(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
  mutate("tasks");
}

// --- Study logs ---
async function fetchStudyLogs(): Promise<StudyLog[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("study_logs").select("*").order("studied_at", { ascending: false });
  if (error) throw error;
  return (data as LogRow[]).map(rowToLog);
}

export function useStudyLogs(): StudyLog[] {
  const { data } = useSWR("study_logs", fetchStudyLogs);
  return data ?? [];
}

export async function addStudyLog(input: Omit<StudyLog, "id" | "createdAt">) {
  const supabase = createClient();
  const { error } = await supabase.from("study_logs").insert({
    task_id: input.taskId,
    title: input.title,
    duration_minutes: input.durationMinutes,
    studied_at: input.studiedAt,
    memo: input.memo,
  });
  if (error) throw error;
  mutate("study_logs");
}

export async function deleteStudyLog(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("study_logs").delete().eq("id", id);
  if (error) throw error;
  mutate("study_logs");
}

// --- Settings ---
async function fetchSettings(): Promise<Settings> {
  const supabase = createClient();
  const { data } = await supabase.from("user_settings").select("notify_enabled, notify_timing").maybeSingle();
  if (!data) return DEFAULT_SETTINGS;
  return { notifyEnabled: data.notify_enabled, notifyTiming: data.notify_timing };
}

export function useSettings(): Settings {
  const { data } = useSWR("user_settings", fetchSettings);
  return data ?? DEFAULT_SETTINGS;
}

export async function updateSettings(patch: Partial<Settings>) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const current = await fetchSettings();
  const next = { ...current, ...patch };
  const { error } = await supabase
    .from("user_settings")
    .upsert({ user_id: user.id, notify_enabled: next.notifyEnabled, notify_timing: next.notifyTiming });
  if (error) throw error;
  mutate("user_settings");
}

// --- Auth ---
export function useUser(): { email: string | null; loading: boolean } {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return { email, loading };
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
}

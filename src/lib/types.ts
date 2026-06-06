export type Status = "todo" | "in_progress" | "done" | "hold";
export type Priority = "high" | "mid" | "low";

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  status: Status;
  priority: Priority;
  tags: string[];
  notifyEnabled: boolean;
  notifyBeforeMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudyLog {
  id: string;
  taskId: string | null;
  title: string;
  durationMinutes: number;
  studiedAt: string;
  memo: string;
  createdAt: string;
}

export interface Settings {
  notifyEnabled: boolean;
  notifyTiming: number;
}

export const STATUS_LABEL: Record<Status, string> = {
  todo: "未着手",
  in_progress: "進行中",
  done: "完了",
  hold: "保留",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  high: "高",
  mid: "中",
  low: "低",
};

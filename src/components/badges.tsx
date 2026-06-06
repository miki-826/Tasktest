import { cn } from "@/lib/utils";
import { PRIORITY_LABEL, STATUS_LABEL, type Priority, type Status } from "@/lib/types";

export function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    todo: "border border-neutral-300 bg-white text-neutral-700",
    in_progress: "bg-black text-white",
    done: "bg-neutral-100 text-neutral-400 line-through",
    hold: "border border-dashed border-neutral-400 text-neutral-500",
  };
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs", styles[status])}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const styles: Record<Priority, string> = {
    high: "bg-black text-white",
    mid: "border border-black text-black",
    low: "border border-neutral-300 text-neutral-400",
  };
  const text: Record<Priority, string> = { high: "HIGH", mid: "MID", low: "LOW" };
  return (
    <span
      className={cn("inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wide", styles[priority])}
      title={`優先度: ${PRIORITY_LABEL[priority]}`}
    >
      {text[priority]}
    </span>
  );
}

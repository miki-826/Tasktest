"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold tracking-[-0.01em] transition-all duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40";
  const variants = {
    primary: "bg-black text-white shadow-[0_12px_30px_rgba(0,0,0,0.16)] hover:bg-neutral-800",
    secondary: "border border-neutral-300 bg-white text-black shadow-sm hover:border-black hover:bg-neutral-50",
    ghost: "text-neutral-600 hover:bg-neutral-100 hover:text-black",
  };
  return <button className={cn(base, variants[variant], className)} {...props} />;
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-white/70 bg-white/85 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.03] backdrop-blur-sm", className)}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
  return (
    <Card className="group flex flex-col gap-1 transition-shadow hover:shadow-md">
      <span className="font-heading text-xs uppercase tracking-wide text-neutral-500">{label}</span>
      <span className="font-mono text-3xl font-semibold leading-tight text-neutral-900">{value}</span>
      {sub && <span className="text-xs text-neutral-500">{sub}</span>}
    </Card>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 shadow-inner shadow-black/[0.02] outline-none transition-colors placeholder:text-neutral-400 focus:border-black",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 shadow-inner shadow-black/[0.02] outline-none transition-colors placeholder:text-neutral-400 focus:border-black",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 shadow-inner shadow-black/[0.02] outline-none transition-colors focus:border-black",
        className,
      )}
      {...props}
    />
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-heading text-xs uppercase tracking-wide text-neutral-500">{label}</span>
      {children}
    </div>
  );
}

export function Tag({ children, active, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <span
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        onClick && "cursor-pointer select-none",
        active
          ? "border-black bg-black text-white"
          : "border-neutral-300 bg-white text-neutral-700 hover:border-black hover:bg-neutral-100",
      )}
    >
      {children}
    </span>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4 rounded-[1.75rem] border border-white/70 bg-white/55 p-5 shadow-[0_18px_45px_rgba(0,0,0,0.05)] backdrop-blur">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-[-0.055em] text-neutral-950">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="animate-overlay-in fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/40 p-0 backdrop-blur-sm sm:items-start sm:p-4 sm:py-8"
      onClick={onClose}
    >
      <div
        className="animate-modal-in max-h-[calc(100dvh-1.5rem)] w-full overflow-y-auto overscroll-contain rounded-t-[2rem] border border-white/70 bg-white p-6 shadow-[0_35px_90px_rgba(0,0,0,0.22)] sm:my-auto sm:max-h-[calc(100dvh-4rem)] sm:max-w-2xl sm:rounded-[2rem]"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

"use client";

import { useRouter } from "next/navigation";
import { signOut, updateSettings, useSettings, useUser } from "@/lib/store";
import { Button, Card, PageHeader } from "@/components/ui";
import { cn } from "@/lib/utils";

const TIMINGS = [
  { value: 4320, label: "3日前" },
  { value: 1440, label: "1日前" },
  { value: 540, label: "当日朝" },
  { value: 60, label: "1時間前" },
];

export default function SettingsPage() {
  const settings = useSettings();
  const { email } = useUser();
  const router = useRouter();

  async function handleLogout() {
    try {
      await signOut();
    } finally {
      router.replace("/login");
    }
  }

  return (
    <>
      <PageHeader title="Settings" subtitle="通知やアカウントの設定" />

      <Card className="mb-3">
        <h2 className="font-heading mb-4 font-bold">Email Notification</h2>
        <div className="flex items-center justify-between border-b border-neutral-200 py-3">
          <div>
            <div className="text-sm font-medium text-neutral-900">メール通知</div>
            <div className="text-xs text-neutral-500">期限前にメールで通知します（拡張機能予定）</div>
          </div>
          <button
            onClick={() => updateSettings({ notifyEnabled: !settings.notifyEnabled })}
            className={cn(
              "relative h-6 w-11 rounded-full transition-colors",
              settings.notifyEnabled ? "bg-black" : "bg-neutral-300",
            )}
            aria-label="メール通知切り替え"
          >
            <span
              className={cn(
                "absolute top-0.5 size-5 rounded-full bg-white transition-all",
                settings.notifyEnabled ? "left-[22px]" : "left-0.5",
              )}
            />
          </button>
        </div>

        <div className="py-3">
          <div className="mb-2 text-sm font-medium text-neutral-900">通知タイミング</div>
          <div className="flex flex-wrap gap-2">
            {TIMINGS.map((t) => (
              <button
                key={t.value}
                onClick={() => updateSettings({ notifyTiming: t.value })}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-sm transition-colors",
                  settings.notifyTiming === t.value
                    ? "border-black bg-black text-white"
                    : "border-neutral-300 bg-white text-black hover:bg-neutral-100",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="font-heading mb-4 font-bold">Account</h2>
        <div className="flex items-center justify-between border-b border-neutral-200 py-3 text-sm">
          <span className="text-neutral-500">メールアドレス</span>
          <span className="font-mono">{email ?? "..."}</span>
        </div>
        <div className="pt-4">
          <Button variant="secondary" onClick={handleLogout}>
            ログアウト
          </Button>
        </div>
      </Card>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/utils";

type Mode = "login" | "signup";
type Step = "form" | "confirm";

const AUTH_CONFIRMATION_ERROR = "確認リンクの検証に失敗しました。メールを再送するか、もう一度登録してください。";

function getConfirmRedirectUrl() {
  if (typeof window === "undefined") return undefined;
  return `${window.location.origin}/auth/confirm`;
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const trimmedEmail = email.trim();
  const isLogin = mode === "login";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") !== "auth-confirmation-failed") return;

    window.history.replaceState(null, "", window.location.pathname);
    const timer = window.setTimeout(() => setError(AUTH_CONFIRMATION_ERROR), 0);
    return () => window.clearTimeout(timer);
  }, []);

  function reset() {
    setError(null);
    setMessage(null);
  }

  function switchMode(next: Mode) {
    setMode(next);
    setStep("form");
    setPassword("");
    reset();
  }

  async function signIn() {
    reset();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  async function signUp() {
    reset();
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        emailRedirectTo: getConfirmRedirectUrl(),
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      router.replace("/");
      router.refresh();
    } else {
      setStep("confirm");
      setMessage(`${trimmedEmail} に確認メールを送信しました。メール内のリンクを開くと登録が完了します。`);
    }
  }

  async function resendConfirmation() {
    reset();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: trimmedEmail,
      options: {
        emailRedirectTo: getConfirmRedirectUrl(),
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setMessage("確認メールを再送しました。メール内のリンクから登録を完了してください。");
  }

  const confirmView = (
    <div className="flex flex-col gap-5">
      <div className="flex size-12 items-center justify-center rounded-full border border-black bg-black text-white shadow-[0_12px_35px_rgba(0,0,0,0.22)]">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.4">
          <path d="M4 6h16v12H4z" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      </div>
      <div>
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.35em] text-neutral-500">Check your inbox</p>
        <h1 className="font-heading text-2xl font-semibold tracking-[-0.04em] text-neutral-950">メール確認が必要です</h1>
        <p className="mt-2 text-sm leading-6 text-neutral-600">{message}</p>
      </div>
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm leading-6 text-neutral-600">
        新規登録は、Supabase の通常の確認リンクで完了します。番号の入力は不要です。
      </div>
      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">⚠ {error}</p>}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button onClick={resendConfirmation} disabled={loading || !trimmedEmail} className="flex-1">
          {loading ? "送信中..." : "確認メールを再送"}
        </Button>
        <Button variant="secondary" onClick={() => switchMode("login")} className="flex-1">
          ログインへ
        </Button>
      </div>
    </div>
  );

  const formView = (
    <>
      <div className="mb-6 grid grid-cols-2 gap-1 rounded-[1.5rem] border border-neutral-200 bg-neutral-100/80 p-1 shadow-inner">
        {(["login", "signup"] as Mode[]).map((m) => {
          const active = mode === m;
          return (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={cn(
                "rounded-[1.2rem] px-3 py-3 text-left transition-all",
                active ? "bg-black text-white shadow-[0_8px_20px_rgba(0,0,0,0.18)]" : "text-neutral-500 hover:text-black",
              )}
            >
              <span className="block text-sm font-semibold">{m === "login" ? "ログイン" : "新規登録"}</span>
              <span className={cn("mt-0.5 block text-[11px]", active ? "text-neutral-300" : "text-neutral-500")}>
                {m === "login" ? "登録済みの方" : "はじめての方"}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mb-6">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.35em] text-neutral-500">Minimal Focus</p>
        <h1 className="font-heading text-3xl font-semibold tracking-[-0.055em] text-neutral-950">
          {isLogin ? "ログイン" : "新規登録"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-neutral-500">
          {isLogin
            ? "すでに作成済みのアカウントで入ります。"
            : "メールアドレスとパスワードを登録し、届いた確認メールのリンクを開いて完了します。"}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Input type="email" placeholder="メールアドレス" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        <Input
          type="password"
          placeholder={isLogin ? "パスワード" : "パスワード（6文字以上）"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={isLogin ? "current-password" : "new-password"}
        />
        <p className="text-xs leading-5 text-neutral-500">
          {isLogin ? "アカウントがない場合は、上の「新規登録」に切り替えてください。" : "登録後に確認メールを送ります。認証番号の入力はありません。"}
        </p>
        {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">⚠ {error}</p>}
        {message && <p className="text-sm text-neutral-500">{message}</p>}
        {isLogin ? (
          <Button onClick={signIn} disabled={loading || !trimmedEmail || !password} className="mt-1 w-full py-3">
            {loading ? "ログイン中..." : "ログインする"}
          </Button>
        ) : (
          <Button onClick={signUp} disabled={loading || !trimmedEmail || !password} className="mt-1 w-full py-3">
            {loading ? "送信中..." : "確認メールを送って登録"}
          </Button>
        )}
      </div>
    </>
  );

  const cardClass = "rounded-[2rem] border border-white/70 bg-white/90 p-7 shadow-[0_35px_90px_rgba(0,0,0,0.22)] backdrop-blur-2xl";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f4f1] p-4 text-neutral-950 sm:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.95),transparent_30%),radial-gradient(circle_at_80%_25%,rgba(0,0,0,0.10),transparent_28%),linear-gradient(135deg,#ffffff_0%,#efefeb_45%,#111111_100%)]" />
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(#111_1px,transparent_1px),linear-gradient(90deg,#111_1px,transparent_1px)] [background-size:42px_42px]" />

      <div className="relative hidden w-full max-w-6xl overflow-hidden rounded-[2.25rem] border border-white/50 bg-white shadow-[0_45px_120px_rgba(0,0,0,0.28)] md:block" style={{ aspectRatio: "1672 / 941" }}>
        <div className="absolute inset-0 bg-cover bg-center grayscale" style={{ backgroundImage: "url('/login-bg.png')" }} />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.15),rgba(255,255,255,0.55)_48%,rgba(255,255,255,0.9))]" />
        <div className={cn("absolute right-[6%] top-1/2 w-[clamp(350px,34%,430px)] -translate-y-1/2", cardClass)}>
          {step === "confirm" ? confirmView : formView}
        </div>
      </div>

      <div className={cn("relative w-full max-w-sm md:hidden", cardClass)}>{step === "confirm" ? confirmView : formView}</div>
    </div>
  );
}

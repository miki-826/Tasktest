"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/utils";

type Mode = "login" | "signup";
type Step = "form" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function reset() {
    setError(null);
    setMessage(null);
  }

  function switchMode(next: Mode) {
    setMode(next);
    setStep("form");
    reset();
  }

  async function signIn() {
    reset();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
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
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      router.replace("/");
      router.refresh();
    } else {
      setStep("otp");
      setMessage(`${email.trim()} に確認コードを送信しました。メールに届いた6桁の番号を入力してください。`);
    }
  }

  async function verifyCode() {
    reset();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "signup" });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  async function resendCode() {
    reset();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: "signup", email: email.trim() });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setMessage("確認コードを再送しました。");
  }

  const otpView = (
    <div className="flex flex-col gap-3">
      <h1 className="font-heading text-xl font-bold tracking-tight text-neutral-900">確認コードを入力</h1>
      <p className="text-sm text-neutral-600">{message}</p>
      <Input
        inputMode="numeric"
        placeholder="6桁の確認コード"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="text-center font-mono text-lg tracking-[0.3em]"
        autoFocus
      />
      {error && <p className="text-sm text-red-600">⚠ {error}</p>}
      <Button onClick={verifyCode} disabled={loading || code.trim().length < 4} className="mt-1 w-full">
        {loading ? "確認中..." : "コードを確認してログイン"}
      </Button>
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <button onClick={() => switchMode("signup")} className="transition-colors hover:text-black">
          ← 戻る
        </button>
        <button onClick={resendCode} disabled={loading} className="transition-colors hover:text-black disabled:opacity-40">
          コードを再送
        </button>
      </div>
    </div>
  );

  const formView = (
    <>
      <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg border border-neutral-200 bg-neutral-100 p-1">
        {(["login", "signup"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={cn(
              "rounded-md py-2 text-sm font-medium transition-colors",
              mode === m ? "bg-black text-white shadow-sm" : "text-neutral-500 hover:text-black",
            )}
          >
            {m === "login" ? "ログイン" : "新規登録"}
          </button>
        ))}
      </div>

      <div className="mb-5">
        <h1 className="font-heading text-xl font-bold tracking-tight text-neutral-900">
          {mode === "login" ? "おかえりなさい" : "アカウントを作成"}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          {mode === "login" ? "メールとパスワードでログイン" : "登録後、メールの確認コードで認証します"}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Input type="email" placeholder="メールアドレス" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" placeholder="パスワード（6文字以上）" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-600">⚠ {error}</p>}
        {message && <p className="text-sm text-neutral-500">{message}</p>}
        {mode === "login" ? (
          <Button onClick={signIn} disabled={loading || !email || !password} className="mt-1 w-full">
            {loading ? "..." : "ログイン"}
          </Button>
        ) : (
          <Button onClick={signUp} disabled={loading || !email || !password} className="mt-1 w-full">
            {loading ? "..." : "確認コードを送信"}
          </Button>
        )}
      </div>
    </>
  );

  const cardClass = "rounded-2xl border border-neutral-200 bg-white/95 p-7 shadow-2xl backdrop-blur-xl";

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 p-4 sm:p-8">
      {/* PC: 画像とフォームを同じコンテナに入れ、一緒に拡大縮小させる */}
      <div className="relative hidden w-full max-w-6xl overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl md:block" style={{ aspectRatio: "1672 / 941" }}>
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/login-bg.png')" }} />
        <div className={cn("absolute right-[6%] top-1/2 w-[clamp(300px,30%,360px)] -translate-y-1/2", cardClass)}>
          {step === "otp" ? otpView : formView}
        </div>
      </div>

      {/* スマホ: フォームのみ中央表示 */}
      <div className={cn("w-full max-w-sm md:hidden", cardClass)}>{step === "otp" ? otpView : formView}</div>
    </div>
  );
}

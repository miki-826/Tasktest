"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Input } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setError(null);
    setMessage(null);
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
    setError(null);
    setMessage(null);
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
      setMessage("確認メールを送信しました。メール内のリンクを開いてから再度ログインしてください。");
    }
  }

  const formInner = (
    <>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold tracking-tight">Login</h1>
        <p className="mt-1 text-sm text-neutral-600">すべてをシンプルに管理する。</p>
      </div>
      <div className="flex flex-col gap-3">
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-black">⚠ {error}</p>}
        {message && <p className="text-sm text-neutral-700">{message}</p>}
        <Button onClick={signIn} disabled={loading || !email || !password} className="mt-2 w-full">
          {loading ? "..." : "Login"}
        </Button>
        <Button variant="secondary" onClick={signUp} disabled={loading || !email || !password} className="w-full">
          Create Account
        </Button>
      </div>
    </>
  );

  const cardClass = "rounded-2xl border border-neutral-200 bg-white/95 p-7 shadow-2xl backdrop-blur-sm";

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4 sm:p-8">
      {/* PC: 画像とフォームを同じコンテナに入れ、一緒に拡大縮小させる */}
      <div
        className="relative hidden w-full max-w-6xl bg-cover bg-center md:block"
        style={{ backgroundImage: "url('/login-bg.png')", aspectRatio: "1672 / 941" }}
      >
        <div className={`absolute right-[6%] top-1/2 w-[clamp(280px,30%,360px)] -translate-y-1/2 ${cardClass}`}>
          {formInner}
        </div>
      </div>

      {/* スマホ: フォームのみ中央表示 */}
      <div className={`w-full max-w-sm md:hidden ${cardClass}`}>{formInner}</div>
    </div>
  );
}

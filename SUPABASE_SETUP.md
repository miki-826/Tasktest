# Supabase セットアップ手順

クラウド Supabase で「実際のログイン・DB・ユーザー分離(RLS)」を有効にする手順です。

## 1. プロジェクト作成

1. https://supabase.com にログイン → **New project**
2. 名前・DBパスワード・リージョン（Tokyo 推奨）を設定して作成

## 2. URL と anon key を取得して .env.local に設定

1. プロジェクトの **Settings → API**（または Project Settings → API Keys）を開く
2. 以下をコピーして `task-app/.env.local` に貼り付ける（既存のプレースホルダを置き換え）

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (anon / public キー)
```

## 3. テーブルと RLS を作成

1. Supabase ダッシュボードの **SQL Editor** を開く
2. `task-app/supabase/migrations/0001_init.sql` の中身を全部貼り付けて **Run**

## 4.（任意）メール確認をスキップして即ログインしたい場合

- **Authentication → Sign In / Providers → Email** で「Confirm email」を **OFF**
- OFF にすると Create Account 直後にそのままログインできます
- ON のままなら、登録後に届く確認メールのリンクを開いてからログイン

## 5. 起動

```powershell
cd task-app
npm run dev
```

→ http://localhost:3000 で Create Account → アプリ利用開始。
ユーザーごとにデータは RLS で分離されます。

## メール確認（Confirm link）

新規登録は 6 桁コード入力ではなく、Supabase Auth の通常の Confirm メールリンクで完了します。

1. Supabase Dashboard の **Authentication > URL Configuration** で Site URL と Redirect URLs に `https://<your-domain>/auth/confirm`（ローカルは `http://localhost:3000/auth/confirm`）を追加してください。
2. **Authentication > Email Templates > Confirm signup** は、通常の `{{ .ConfirmationURL }}` を使う構成で動作します。SSR/PKCE 用にテンプレートをカスタムする場合は `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email` の形式も利用できます。
3. 本番では Supabase の既定メール送信制限を避けるため、独自 SMTP の設定を推奨します。

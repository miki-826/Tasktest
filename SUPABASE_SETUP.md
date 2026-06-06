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

-- タスクごとの色分け用カラムを追加
alter table public.tasks add column if not exists color text;

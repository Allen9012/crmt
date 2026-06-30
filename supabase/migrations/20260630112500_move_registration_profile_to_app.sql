-- Move registration profile setup out of database triggers.
--
-- Registration now uses server-side application code with the service role:
-- 1. create a confirmed auth user;
-- 2. upsert public.profiles;
-- 3. insert public.operation_audit_logs.
--
-- SQL keeps data constraints and permissions only. It should not hide the
-- registration workflow behind auth/profile triggers.

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

drop trigger if exists profiles_record_audit on public.profiles;
drop trigger if exists posts_record_audit on public.posts;
drop trigger if exists post_images_record_audit on public.post_images;
drop function if exists public.record_row_audit();

grant insert on table public.operation_audit_logs to service_role;
grant usage, select on sequence public.operation_audit_logs_id_seq to service_role;

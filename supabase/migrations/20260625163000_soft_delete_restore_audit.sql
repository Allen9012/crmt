-- 目标
-- 1. 保持向后兼容：只做增量变更，不回收旧列、不清理旧数据。
-- 2. 优先业务逻辑控制：取消 post_images 的物理级联，删除/恢复由业务函数驱动。
-- 3. 可恢复：为 posts / post_images 增加软删除与恢复元数据。
-- 4. 可追溯：为关键表增加统一审计表，记录创建、更新、软删除、恢复、物理删除。

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1) 软删除与恢复字段
-- -----------------------------------------------------------------------------
-- 说明：
-- - deleted_at 继续作为“是否可见”的主标记。
-- - deleted_by / delete_reason 记录删除来源，便于误删排查。
-- - restored_at / restored_by 记录恢复动作。
-- - 这些字段都是增量添加，旧数据不会受影响。

alter table public.posts
  add column if not exists deleted_by uuid references auth.users(id) on delete set null,
  add column if not exists delete_reason text,
  add column if not exists restored_at timestamptz,
  add column if not exists restored_by uuid references auth.users(id) on delete set null;

alter table public.post_images
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references auth.users(id) on delete set null,
  add column if not exists delete_reason text,
  add column if not exists restored_at timestamptz,
  add column if not exists restored_by uuid references auth.users(id) on delete set null,
  add column if not exists updated_at timestamptz not null default now();

comment on column public.posts.deleted_at is '软删除时间。非空表示内容已下架，但保留数据用于恢复与审计。';
comment on column public.posts.deleted_by is '执行软删除的用户。';
comment on column public.posts.delete_reason is '软删除原因，便于人工排查与恢复。';
comment on column public.posts.restored_at is '恢复时间。';
comment on column public.posts.restored_by is '执行恢复的用户。';

comment on column public.post_images.deleted_at is '软删除时间。图片是否可见以此字段为准。';
comment on column public.post_images.deleted_by is '执行软删除的用户。';
comment on column public.post_images.delete_reason is '软删除原因，便于人工排查与恢复。';
comment on column public.post_images.restored_at is '恢复时间。';
comment on column public.post_images.restored_by is '执行恢复的用户。';

-- -----------------------------------------------------------------------------
-- 2) 去掉物理级联，改为业务逻辑控制
-- -----------------------------------------------------------------------------
-- 说明：
-- - 生产环境通常避免靠 ON DELETE CASCADE 做父子数据联动删除。
-- - 这里仅将 post_images 的外键改为 RESTRICT，避免 posts 被物理删除时自动级联清除图片。
-- - 业务层应通过 soft_delete_post / restore_post / soft_delete_post_image / restore_post_image 操作数据。

alter table public.post_images
  drop constraint if exists post_images_post_id_fkey;

alter table public.post_images
  add constraint post_images_post_id_fkey
  foreign key (post_id) references public.posts(id) on delete restrict;

-- -----------------------------------------------------------------------------
-- 3) 索引优化：可见数据、回收数据都要好查
-- -----------------------------------------------------------------------------
-- 说明：
-- - 公开流仍主要访问未删除数据。
-- - 恢复/审计/后台排查时，也需要快速定位被删除的数据。

create index if not exists posts_visible_created_at_idx
  on public.posts(created_at desc)
  where deleted_at is null;

create index if not exists posts_author_visible_created_at_idx
  on public.posts(author_id, created_at desc)
  where deleted_at is null;

create index if not exists posts_deleted_at_idx
  on public.posts(deleted_at desc)
  where deleted_at is not null;

create index if not exists post_images_visible_post_sort_idx
  on public.post_images(post_id, sort_order)
  where deleted_at is null;

create index if not exists post_images_deleted_at_idx
  on public.post_images(deleted_at desc)
  where deleted_at is not null;

create index if not exists post_images_post_sort_idx
  on public.post_images(post_id, sort_order);

-- -----------------------------------------------------------------------------
-- 4) 统一更新时间触发器
-- -----------------------------------------------------------------------------
-- 说明：
-- - post_images 也补上 updated_at，方便识别后续的编辑/恢复动作。
-- - 这不会影响既有行，只是把更新的时间点保留下来。

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row
  execute function public.set_updated_at();

drop trigger if exists post_images_set_updated_at on public.post_images;
create trigger post_images_set_updated_at
  before update on public.post_images
  for each row
  execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 5) 软删除 / 恢复元数据归一化
-- -----------------------------------------------------------------------------
-- 说明：
-- - 任何直接 UPDATE deleted_at 的路径，都会被这里补齐 deleted_by / restored_by / restored_at。
-- - 这样即使业务层代码漏填，数据库也能维持一致性。
-- - 这是“业务逻辑优先”的补强，不是让应用绕过逻辑。

create or replace function public.normalize_soft_delete_metadata()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' then
    if old.deleted_at is null and new.deleted_at is not null then
      new.deleted_by := coalesce(new.deleted_by, auth.uid());
      new.restored_at := null;
      new.restored_by := null;
    elsif old.deleted_at is not null and new.deleted_at is null then
      new.restored_at := coalesce(new.restored_at, now());
      new.restored_by := coalesce(new.restored_by, auth.uid());
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists posts_normalize_soft_delete_metadata on public.posts;
create trigger posts_normalize_soft_delete_metadata
  before update on public.posts
  for each row
  execute function public.normalize_soft_delete_metadata();

drop trigger if exists post_images_normalize_soft_delete_metadata on public.post_images;
create trigger post_images_normalize_soft_delete_metadata
  before update on public.post_images
  for each row
  execute function public.normalize_soft_delete_metadata();

-- -----------------------------------------------------------------------------
-- 6) 审计表
-- -----------------------------------------------------------------------------
-- 说明：
-- - append-only，禁止应用层直接依赖它做业务逻辑。
-- - 主要用途是：回溯谁在什么时间对哪条记录做了什么操作。
-- - old_data / new_data 以 JSONB 形式保留快照，便于排障和审计。

create table if not exists public.operation_audit_logs (
  id bigint generated always as identity primary key,
  table_schema text not null,
  table_name text not null,
  record_id uuid,
  action text not null check (action in ('create', 'update', 'soft_delete', 'restore', 'delete')),
  actor_id uuid,
  actor_role text not null,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

comment on table public.operation_audit_logs is '关键操作审计表：记录创建、更新、软删除、恢复与物理删除。';
comment on column public.operation_audit_logs.old_data is '操作前的整行快照。';
comment on column public.operation_audit_logs.new_data is '操作后的整行快照。';

create index if not exists operation_audit_logs_table_record_created_idx
  on public.operation_audit_logs(table_schema, table_name, record_id, created_at desc);

create index if not exists operation_audit_logs_created_at_idx
  on public.operation_audit_logs(created_at desc);

alter table public.operation_audit_logs enable row level security;

revoke all on table public.operation_audit_logs from anon, authenticated;
grant select on table public.operation_audit_logs to service_role;

-- -----------------------------------------------------------------------------
-- 7) 审计触发器
-- -----------------------------------------------------------------------------
-- 说明：
-- - 对 profiles / posts / post_images 统一记录审计。
-- - 更新时根据 deleted_at 的变化识别 soft_delete / restore。
-- - 若未来增加更多需要审计的表，可复用这个函数。

create or replace function public.record_row_audit()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_old jsonb := to_jsonb(old);
  v_new jsonb := to_jsonb(new);
  v_action text;
  v_record_id uuid;
begin
  v_record_id := coalesce((v_new ->> 'id')::uuid, (v_old ->> 'id')::uuid);

  if tg_op = 'INSERT' then
    v_action := 'create';
  elsif tg_op = 'DELETE' then
    v_action := 'delete';
  elsif (v_old ? 'deleted_at') and (v_new ? 'deleted_at') then
    if (v_old ->> 'deleted_at') is null and (v_new ->> 'deleted_at') is not null then
      v_action := 'soft_delete';
    elsif (v_old ->> 'deleted_at') is not null and (v_new ->> 'deleted_at') is null then
      v_action := 'restore';
    else
      v_action := 'update';
    end if;
  else
    v_action := 'update';
  end if;

  insert into public.operation_audit_logs (
    table_schema,
    table_name,
    record_id,
    action,
    actor_id,
    actor_role,
    old_data,
    new_data
  )
  values (
    tg_table_schema,
    tg_table_name,
    v_record_id,
    v_action,
    auth.uid(),
    coalesce(auth.role(), 'anonymous'),
    v_old,
    v_new
  );

  return null;
end;
$$;

drop trigger if exists profiles_record_audit on public.profiles;
create trigger profiles_record_audit
  after insert or update or delete on public.profiles
  for each row
  execute function public.record_row_audit();

drop trigger if exists posts_record_audit on public.posts;
create trigger posts_record_audit
  after insert or update or delete on public.posts
  for each row
  execute function public.record_row_audit();

drop trigger if exists post_images_record_audit on public.post_images;
create trigger post_images_record_audit
  after insert or update or delete on public.post_images
  for each row
  execute function public.record_row_audit();

-- -----------------------------------------------------------------------------
-- 8) 面向业务的软删除 / 恢复 RPC
-- -----------------------------------------------------------------------------
-- 说明：
-- - 应用层不要直接发 delete。
-- - 统一通过这些函数做软删除 / 恢复，保证 post 与 post_images 状态联动。
-- - 如果未来要加“彻底删除”保留窗口，可在这里扩展，而不影响前端调用。

create or replace function public.soft_delete_post(p_post_id uuid, p_reason text default null)
returns void
language plpgsql
as $$
begin
  update public.posts
     set deleted_at = now(),
         deleted_by = auth.uid(),
         delete_reason = p_reason
   where id = p_post_id
     and author_id = auth.uid()
     and deleted_at is null;

  update public.post_images
     set deleted_at = now(),
         deleted_by = auth.uid(),
         delete_reason = p_reason
   where post_id = p_post_id
     and deleted_at is null;
end;
$$;

create or replace function public.restore_post(p_post_id uuid)
returns void
language plpgsql
as $$
begin
  update public.posts
     set deleted_at = null,
         restored_at = now(),
         restored_by = auth.uid()
   where id = p_post_id
     and author_id = auth.uid()
     and deleted_at is not null;

  update public.post_images
     set deleted_at = null,
         restored_at = now(),
         restored_by = auth.uid()
   where post_id = p_post_id
     and deleted_at is not null;
end;
$$;

create or replace function public.soft_delete_post_image(p_post_image_id uuid, p_reason text default null)
returns void
language plpgsql
as $$
begin
  update public.post_images
     set deleted_at = now(),
         deleted_by = auth.uid(),
         delete_reason = p_reason
   where id = p_post_image_id
     and deleted_at is null
     and exists (
       select 1
         from public.posts
        where posts.id = post_images.post_id
          and posts.author_id = auth.uid()
     );
end;
$$;

create or replace function public.restore_post_image(p_post_image_id uuid)
returns void
language plpgsql
as $$
begin
  update public.post_images
     set deleted_at = null,
         restored_at = now(),
         restored_by = auth.uid()
   where id = p_post_image_id
     and deleted_at is not null
     and exists (
       select 1
         from public.posts
        where posts.id = post_images.post_id
          and posts.author_id = auth.uid()
     );
end;
$$;

grant execute on function public.soft_delete_post(uuid, text) to authenticated;
grant execute on function public.restore_post(uuid) to authenticated;
grant execute on function public.soft_delete_post_image(uuid, text) to authenticated;
grant execute on function public.restore_post_image(uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- 9) RLS 调整
-- -----------------------------------------------------------------------------
-- 说明：
-- - profiles 继续“公开读、本人改写”。
-- - posts 继续按 author / deleted_at 控制可见性。
-- - post_images 新增 update 权限，给软删除 / 恢复留口子。
-- - 删除仍然不开放给应用层，避免回到物理删除模型。

drop policy if exists "visible post images are readable" on public.post_images;
create policy "visible post images are readable"
  on public.post_images for select
  using (
    deleted_at is null
    or exists (
      select 1
        from public.posts
       where posts.id = post_images.post_id
         and posts.author_id = auth.uid()
    )
  );

drop policy if exists "users insert own posts" on public.posts;
create policy "users insert own posts"
  on public.posts for insert
  with check (
    deleted_at is null
    and auth.uid() = author_id
  );

drop policy if exists "post authors insert images" on public.post_images;
create policy "post authors insert images"
  on public.post_images for insert
  with check (
    deleted_at is null
    and exists (
      select 1
        from public.posts
       where posts.id = post_images.post_id
         and posts.author_id = auth.uid()
         and posts.deleted_at is null
    )
  );

drop policy if exists "post authors update images" on public.post_images;
create policy "post authors update images"
  on public.post_images for update
  using (
    exists (
      select 1
        from public.posts
       where posts.id = post_images.post_id
         and posts.author_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
        from public.posts
       where posts.id = post_images.post_id
         and posts.author_id = auth.uid()
    )
  );

drop policy if exists "post authors delete images" on public.post_images;

comment on function public.soft_delete_post(uuid, text) is '按业务语义软删除动态，同时联动软删除该动态下的图片。';
comment on function public.restore_post(uuid) is '恢复已软删除的动态，同时联动恢复该动态下的图片。';
comment on function public.soft_delete_post_image(uuid, text) is '按业务语义软删除单张图片。';
comment on function public.restore_post_image(uuid) is '恢复已软删除的单张图片。';

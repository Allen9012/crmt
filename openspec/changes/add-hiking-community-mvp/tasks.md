# Implementation Tasks — add-hiking-community-mvp

> 任务按依赖顺序排列。每项可在一个工作单元内完成且可验证。
> 对应能力：user-auth / user-profile / post-publishing / post-feed / post-management / content-moderation。

## 1. 项目脚手架与基础设施

- [x] 1.1 用 pnpm 初始化 Next.js（TypeScript + App Router + Tailwind + src 目录），可本地启动空白页
- [x] 1.2 引入并初始化 shadcn/ui，配置基础主题与组件目录
- [x] 1.3 配置 ESLint + Prettier + tsconfig 严格模式，确保 lint/build 通过
- [x] 1.4 添加 vitest 测试框架与示例用例，确保 `pnpm test` 可运行
- [x] 1.5 创建 `.env.example`，列出 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY
- [x] 1.6 编写 README：本地启动、Supabase 配置、数据分层约定、环境变量说明

## 2. Supabase 接入与数据模型

- [ ] 2.0 安装并配置 Supabase CLI，创建/link 云端项目，初始化本地 `supabase/` 目录；启用邮箱 provider 并保留邮箱验证
- [x] 2.1 实现 `lib/supabase/server.ts` 与 `lib/supabase/browser.ts`（基于 @supabase/ssr，cookie 会话）
- [x] 2.2 编写 migration：创建 `profiles` 表（id PK=auth.users.id, nickname, bio, avatar_path, timestamps）
- [x] 2.3 编写 migration：创建 `posts` 表（id, author_id FK, body, meta jsonb, timestamps, deleted_at）
- [x] 2.4 编写 migration：创建 `post_images` 表（id, post_id FK cascade, storage_path, sort_order, created_at）
- [x] 2.5 编写 migration：创建索引（posts 倒序 where deleted_at is null；posts 按 author；post_images 按 post_id,sort_order）
- [x] 2.6 编写触发器：监听 auth.users 插入自动建 profile（nickname=邮箱前缀），覆盖邮箱与 Google 首登
- [x] 2.7 创建 Storage `images` bucket，配置读策略（public 读）与写策略（仅登录用户、路径限 `{uid}/` 前缀）
- [ ] 2.8 用 `supabase gen types` 生成 DB 类型到 `src/types`，供领域层引用

## 3. RLS 行级权限（安全核心，需多账号验证）

- [x] 3.1 编写 profiles RLS：select 公开；insert/update 仅 auth.uid()=id
- [x] 3.2 编写 posts RLS：select 仅 deleted_at is null（作者可读自己全部）；insert 仅 author_id=auth.uid()；update 仅作者；禁止物理 delete
- [x] 3.3 编写 post_images RLS：select 跟随 post 可见性；insert/delete 仅关联 post 的作者
- [ ] 3.4 用至少两个不同账号集成测试 RLS：越权 read/insert/update/delete 必须失败

## 4. 认证能力（user-auth）

- [ ] 4.1 实现注册页：邮箱+密码注册，密码强度校验（<6 拒绝），邮箱重复提示
- [ ] 4.2 实现邮箱验证流程：注册后发验证邮件，未确认邮箱不能登录/发布，登录时给出验证提示
- [ ] 4.3 实现登录页：邮箱+密码登录成功后跳转动态流
- [ ] 4.4 实现 Google OAuth 登录入口与 `/auth/callback` 回调换取 session（可选能力）
- [ ] 4.5 实现登出：清除会话回到游客状态
- [ ] 4.6 实现 `lib/domain/auth`：服务端读取当前用户/会话的统一工具
- [ ] 4.7 实现未登录访问受保护页面（/posts/new、/settings/profile）时重定向登录页（带回跳参数）
- [ ] 4.8 验证邮箱账号与同邮箱 Google 账号为两个独立身份（MVP 不合并）

## 5. 用户资料能力（user-profile）

- [ ] 5.1 实现 `lib/domain/profile`：读取与更新资料
- [x] 5.2 实现 `lib/validation` 中资料校验（昵称 1..30、简介 ≤200）的 zod schema
- [x] 5.3 为资料校验 schema 写单元测试（合法/空昵称/超长昵称/超长简介）
- [ ] 5.4 实现资料编辑页 `/settings/profile`：保存昵称与简介，非法输入拒绝并提示
- [ ] 5.5 实现头像占位逻辑（未设置头像时用占位图）

## 6. 内容审核责任链骨架（content-moderation）

- [x] 6.1 定义 `lib/domain/moderation`：ModerationContext / ModerationResult / ModerationHandler 接口
- [x] 6.2 实现 `moderateContent` 责任链执行器，空链默认返回 allowed:true
- [x] 6.3 为责任链执行器写单元测试（空链放行、模拟拒绝节点阻断），验证新增节点不改调用方

## 7. 发布动态能力（post-publishing）

- [x] 7.1 实现 `lib/validation` 中发帖校验（正文 ≤2000、空内容拒绝、图片数 ≤9、单图 ≤10MB 且为图片类型）
- [x] 7.2 为发帖校验写单元测试（空内容拒绝、正文超长、图片超 9 张、单图超限/非图片）
- [ ] 7.3 实现 `lib/domain/image`：图片按上传顺序上传到 Storage（路径 images/{uid}/{postId}/{n}.{ext}）与校验
- [ ] 7.4 实现 `lib/domain/post` 的 createPost：鉴权→校验→调 moderateContent→传图→事务写 posts+post_images
- [ ] 7.5 实现写库失败时尽力清理已上传图片（best-effort），避免孤儿文件
- [ ] 7.6 实现发布页 `/posts/new`：表单（正文+多图）、Server Action 提交、成功跳转详情（未登录访问的重定向见 4.7）

## 8. 动态流与详情能力（post-feed）

- [ ] 8.1 实现 `lib/domain/post` 的 listPosts：未删除、时间倒序、分页（默认 20 条）
- [ ] 8.2 实现动态流首页 `/`：卡片展示作者昵称/时间/正文摘要（前 100 字截断）/首图，加载更多
- [ ] 8.3 实现空状态：无动态时引导发布第一条
- [ ] 8.4 实现 `lib/domain/post` 的 getPost：取单条含全部图片
- [ ] 8.5 实现动态详情页 `/posts/[id]`：完整正文+全部图片+作者+时间
- [ ] 8.6 实现详情页对不存在/已删除动态展示"内容不存在"

## 9. 个人主页与管理能力（post-management）

- [ ] 9.1 实现 `lib/domain/post` 的 listMyPosts：当前用户未删除动态、时间倒序
- [ ] 9.2 实现个人主页 `/u/[id]`：展示该用户动态列表
- [ ] 9.3 实现软删除 Server Action：写 deleted_at，仅作者可操作
- [ ] 9.4 验证删除后动态从动态流与详情消失；越权删除被 RLS 拒绝

## 10. 端到端验证与收尾

- [ ] 10.1 跑通主闭环：注册→邮箱验证→登录→编辑昵称→发带图动态→动态流可见→进详情→个人主页删除
- [ ] 10.2 验证游客可浏览流与详情，但发布/删除入口不可用或被拒绝
- [ ] 10.3 验证图片存于 Storage、DB 记录仅含引用路径
- [ ] 10.4 运行 lint / build / 单元测试全部通过，清理临时文件
- [ ] 10.5 补充服务条款占位静态页，完善 README 部署说明

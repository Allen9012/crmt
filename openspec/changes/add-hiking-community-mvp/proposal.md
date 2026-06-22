## Why

徒步爱好者缺少一个轻量、聚焦的图文社区来记录和分享徒步动态。我们需要先用最小成本验证「徒步图文社区是否有人用」这一核心假设，再决定是否投入轨迹、地图、AI 等重功能。现在做，是为了在零用户期用最低成本拿到真实反馈，避免过度工程。

## What Changes

- 新增基于 Next.js + Supabase 的全栈单体应用（TypeScript 单语言）。
- **阶段定位**：本期为「demo 验证阶段」，用 Supabase + Vercel 快速跑通闭环验证想法。目标用户在国内，正式上线运营前需迁移至国内云（备案 + 微信登录），架构按可迁移设计。
- 登录以「邮箱+密码」为主；「Google OAuth」为可选/海外备用（国内网络访问受限，不阻塞主闭环）；邮箱注册保留邮箱验证（需邮件确认后登录）。微信登录为国内正式上线迁移项。
- 用户可维护基础资料（昵称、简介，头像可选）。
- 用户可发布徒步图文动态（正文 ≤2000 字 + 最多 9 张图片，单图 ≤10MB）。
- 图片原图存入对象存储（Supabase Storage），数据库仅存引用路径。
- 任何人可浏览动态流（时间倒序、分页/加载更多）与动态详情。
- 用户可在个人主页管理并软删除自己的动态。
- 发布路径接入「内容审核责任链」骨架：MVP 为空实现默认放行，为 V2 接入第三方安全 API 预留扩展点。
- 通过 Postgres RLS 行级权限保证用户只能改/删自己的数据。
- **不在本期**：GPX 轨迹/地图渲染、点赞评论关注、AI（RAG/pgvector/Agent）、社群圈子、多语言后端/微服务/C++。（微信登录见上方迁移项，非长期排除）

## Capabilities

### New Capabilities
- `user-auth`: 邮箱密码与 Google OAuth 登录、会话管理、登出、首次登录自动建资料。
- `user-profile`: 用户资料的创建（注册触发）、读取与编辑（昵称、简介、可选头像）。
- `post-publishing`: 徒步图文动态的发布，含正文/图片校验、图片上传至对象存储、数据分层落盘。
- `post-feed`: 动态流首页（公开、时间倒序、分页/加载更多、空状态）与动态详情展示。
- `post-management`: 个人主页查看本人动态与软删除（含越权保护）。
- `content-moderation`: 内容审核责任链骨架（可扩展、MVP 空实现放行、与发布逻辑解耦）。

### Modified Capabilities
<!-- 无既有 spec，全部为新增能力 -->

## Impact

- **新增代码**：Next.js 应用（App Router）、`lib/domain/*` 领域模块、`lib/supabase/*` 客户端、`lib/validation/*` 校验。
- **数据库**：新增 `profiles` / `posts` / `post_images` 表 + RLS 策略 + 注册自动建资料触发器（`supabase/migrations/`）。
- **对象存储**：新增 `images` bucket，写路径强制 `{uid}/` 前缀。
- **第三方依赖**：Supabase（Auth/Postgres/Storage）、Vercel（部署）、Google OAuth 凭证。
- **环境变量**：`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`（仅服务端）。
- **成本**：demo 阶段目标 0 元（Supabase 免费层 + Vercel 免费层）。
- **未来迁移（非本期）**：正式上线国内需 ICP 备案、迁移至国内云（RDS/OSS）、接入微信登录、落实内容审核合规。领域逻辑封装在 `lib/domain` 以降低迁移成本。
- **不影响**：无既有系统，全新项目。

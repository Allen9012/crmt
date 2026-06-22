## Context

全新项目，无既有系统。目标是用最小成本验证「徒步图文社区是否有人用」。约束：
- **阶段定位**：本期为 demo 验证阶段。目标用户在国内，但 demo 先用境外 Supabase + Vercel 快速跑通，正式上线运营前迁移至国内云。架构按「可迁移」设计。
- 团队规模小，单语言全栈优先（TypeScript）。
- 成本目标 0 元，使用 Supabase 免费层（约 500MB 数据库）与 Vercel 免费层。
- 强约束（NFR1）：重资产（图片二进制）必须存对象存储，数据库只存引用，保护 DB 体积。
- 安全（NFR2）：写操作服务端鉴权 + 数据库 RLS 双防线。
- 需为 V2（轨迹/地图/AI/社交互动）预留演进空间，但本期不实现。

相关产物：动机见 proposal.md；需求与验收场景见 specs/ 下 6 个能力 spec。

## Goals / Non-Goals

**Goals:**
- 跑通端到端闭环：注册/登录 → 编辑资料 → 发图文动态 → 动态流 → 详情 → 软删除。
- 邮箱密码登录（核心，含邮箱验证）；Google OAuth 为可选能力，不阻塞验收。
- 图片直传对象存储，DB 仅存 path。
- RLS 保证用户只能改/删自己的数据。
- 内容审核责任链骨架（空实现放行，与发布逻辑解耦）。
- 模块边界清晰，便于 V2 按需抽离。

**Non-Goals:**
- 不做 GPX 轨迹、地图渲染（2D/3D/Cesium）、PostGIS、pgvector。
- 不做点赞/评论/关注/私信等社交互动。
- 不做微信登录、小程序端。
- 不做 AI 能力（RAG/Agent）。
- 不引入微服务、gRPC、Go/Python/C++、Redis 缓存层。
- 不做压测与高并发优化。

## Decisions

### D1：Next.js 全栈单体（App Router）+ Supabase BaaS
- 选择：前后端同仓同语言（TS），写操作走 Server Actions / Route Handlers，不单起后端服务。
- 理由：MVP 出活最快，AI 辅助语料最密集，前后端类型贯通，无前后端联调成本。
- 备选：前端 Next.js + 独立 Go/Python 后端。否决理由：零用户期凭空增加跨语言联调与类型同步成本。

### D2：用 Supabase Auth，不自研鉴权
- 选择：登录主路径为「邮箱+密码」（保留邮箱验证），Google OAuth 为可选；均走 Supabase Auth；会话用 @supabase/ssr 存 cookie；RLS 复用 auth.uid()。
- **登录方式与国内现实**：demo 阶段以「邮箱+密码」为主闭环；Google OAuth 国内网络访问受限，作为可选/海外备用，不阻塞验收。微信登录是国内正式上线的刚需，列入迁移项（V2/迁移阶段实现，需公众号/开放平台资质）。
- **邮箱验证**：demo 保留 Supabase 默认邮箱确认（注册后需点邮件链接才能登录）。注意 Supabase 免费层发信有限额，测试账号数量受限。
- **身份不合并**：邮箱注册与 Google 登录使用同一邮箱时，视为两个独立账号，不做身份合并（Supabase 默认行为，避免 link identities 的额外复杂度）。
- 理由：MVP 不应在会话/OAuth 上造轮子。
- 备选：自写 JWT。否决理由：成本高、易出安全漏洞，与原始构想"鉴权微服务"过度设计相悖。
- 代价：与 Supabase 耦合，迁国内时鉴权与登录方式需重做（用领域层封装降低耦合）。

### D3：图片用独立表 post_images，动态扩展用 posts.meta JSONB
- 选择：图片拆为独立表（含 sort_order），动态本身预留 meta JSONB 给未来标签/地点。
- 理由：图片需排序、单独校验、未来可能加缩略图/宽高字段，关系表比 JSONB 数组易演进；而轻量、非查询维度的扩展属性用 JSONB 灵活。
- 备选：图片塞进 posts 的 JSONB 数组。否决理由：排序/约束/演进都更别扭。

### D4：写操作走 Server Action + RLS 双防线
- 选择：浏览器不直接写库；写操作经 Server Action 做登录态校验 + zod 校验 + 调审核链，RLS 作为第二道墙。
- 理由：即使应用层漏判，DB 层 RLS 仍拒绝越权（对应 R6.3 / NFR2）。

### D5：软删除（deleted_at），禁止物理删除
- 选择：动态删除写 deleted_at；列表/详情过滤未删除；RLS 禁止物理 delete。
- 理由：避免误删，便于审核下架与人工兜底。

### D6：审核责任链空实现
- 选择：发布路径固定调用 moderateContent；MVP 责任链为空，统一放行；V2 push handler 即可。
- 理由：对应 R7，预留扩展点且与发布逻辑解耦，不改调用方。

### D7：Storage 写路径强制 {uid}/ 前缀
- 选择：图片路径为 images/{uid}/{postId}/{n}.{ext}，Storage 策略限制只能写自身前缀。
- 理由：防止越权覆盖他人文件。

### 数据模型摘要
- profiles(id PK=auth.users.id, nickname, bio, avatar_path?, timestamps)
- posts(id, author_id FK, body, meta jsonb, timestamps, deleted_at)
- post_images(id, post_id FK cascade, storage_path, sort_order, created_at)
- 索引：posts(created_at desc) where deleted_at is null；posts(author_id, created_at desc) where deleted_at is null；post_images(post_id, sort_order)
- 触发器：监听 auth.users 插入自动建 profile（nickname=邮箱前缀），覆盖邮箱与 Google 首登。

### 目录结构（单体内模块自治）
- src/app/*（页面与路由）、src/lib/supabase/{server,browser}.ts、src/lib/domain/{auth,profile,post,image,moderation}、src/lib/validation、supabase/migrations。

### 约定与规则（统一行为）
- **正文摘要**：动态卡片摘要取正文前 100 字符，超出截断并加省略号；详情页展示完整正文。
- **图片排序**：post_images.sort_order = 上传顺序（从 0 递增），MVP 不做拖拽重排；「首图」为 sort_order 最小者。
- **未登录访问受保护页面**：访问需登录的页面（/posts/new、/settings/profile 等）时，未登录用户统一重定向到登录页（带 redirect 回跳参数），而非 404。仅浏览类页面（动态流、详情、个人主页）对游客开放。
- **邮箱验证态**：注册后未确认邮箱的用户视为未完成注册，不能发布；登录时若邮箱未确认，提示去邮箱完成验证。

## Risks / Trade-offs

- [RLS 配置错误导致越权] → migration 内集中管理 RLS；上线前用多账号实测 select/insert/update/delete 越权应失败。**最高优先验证项**。
- [图片传 Storage 成功但 DB 写失败产生孤儿文件] → 先传图后写库，DB 失败尽力删已传图；V2 定时对账清理。跨系统无法做单一事务，这是已知不完美点。
- [与 Supabase 平台耦合（Auth/Storage/RLS）] → 领域逻辑封装在 lib/domain，迁移时只换适配层；接受 MVP 阶段的合理锁定。
- [无自动内容审核的合规风险] → R7 责任链骨架 + 软删除下架 + 人工兜底；V2 接第三方安全 API。
- [Supabase 免费层 500MB 限额] → NFR1 数据分层；监控用量；避免大字段进 DB。
- [offset 分页性能] → MVP 量小可接受；后续切 keyset 分页。
- [国内访问 Vercel/Supabase 不稳 + 数据境外合规风险] → demo 阶段接受（仅小范围验证）；正式上线前迁国内云。迁移成本通过领域层封装控制。

## Migration Plan

本期为全新部署，无数据迁移。demo 上线步骤：
1. 创建 Supabase 项目，启用邮箱 provider（Google provider 可选），配置 OAuth 回调 URL。
2. 执行 supabase/migrations（建表 + RLS + 触发器），创建 images bucket 及其策略。
3. 配置环境变量（anon key 给浏览器，service role key 仅服务端）。
4. 部署 Next.js 到 Vercel，连通 Supabase。
5. 上线前用多账号验证 RLS 与越权行为。

回滚：MVP 无存量数据，回滚即下线部署 + 必要时清空测试数据；schema 变更通过 migration 版本控制可回退。

**国内正式上线迁移（非本期，验证通过后执行）**：
1. ICP 备案（约 2-3 周，需提前启动）。
2. 数据库迁移：Supabase Postgres → 阿里云 RDS / 腾讯云（标准 PG 协议，schema 与数据可迁）。
3. 存储迁移：Supabase Storage → 阿里云 OSS / 腾讯云 COS（替换 `lib/domain/image` 适配层）。
4. 鉴权迁移：替换 Supabase Auth，接入微信登录为主（替换 `lib/domain/auth` 适配层）；RLS 逻辑需在新库重建或在应用层补齐。
5. 内容审核：接入第三方安全 API（往 moderation 责任链 push handler）。

## Open Questions

- ~~部署平台~~（已决策）：demo 阶段用 Vercel + Supabase；目标用户在国内，正式上线运营前迁移至国内云（备案 + RDS/OSS + 微信登录）。这是「先验证后迁移」的有意识取舍，迁移成本通过领域层封装控制。
- 头像功能是否纳入 MVP（当前设为可选，未做时用占位图）。
- 动态流分页：MVP 用 offset，是否一开始就上 keyset？倾向先 offset。

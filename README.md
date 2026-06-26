# crmt — 徒步社群平台（MVP）

一个面向徒步爱好者的图文社区 Web 应用。当前为 **demo 验证阶段**：用最小成本验证「徒步图文社区是否有人用」，先做纯图文，暂不做轨迹/地图。

> 完整需求、设计与任务见 `openspec/changes/add-hiking-community-mvp/`。

## 技术栈

- **全栈框架**：Next.js 16（App Router）+ TypeScript
- **UI**：Tailwind CSS v4 + shadcn/ui
- **后端 / 数据**：Supabase（Auth + Postgres + Storage + RLS）
- **测试**：Vitest
- **部署**：Vercel（demo 阶段）

> 阶段说明：目标用户在国内，demo 先用境外 Supabase + Vercel 跑通；正式上线运营前需迁移至国内云（ICP 备案 + RDS/OSS + 微信登录）。架构按可迁移设计，领域逻辑封装在 `src/lib/domain`。

## 本地启动

前置：Node ≥ 20.19、pnpm。

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量
cp .env.example .env.local
# 填入 Supabase 项目的 URL / anon key / service_role key

# 3. 启动开发服务器
pnpm dev
# 访问 http://localhost:3000
```

## Supabase 配置

1. 在 [supabase.com](https://supabase.com) 创建项目。
2. 从 Settings > API 获取 `URL`、`anon key`、`service_role key`，填入 `.env.local`。
3. Auth 设置：启用 Email provider，保留邮箱验证；Google provider 可选。
4. 执行数据库迁移与 Storage 配置（见后续 `supabase/migrations`，任务组 2-3 实现）。

> 安全红线：`SUPABASE_SERVICE_ROLE_KEY` 是最高权限密钥，仅用于服务端，绝不下发浏览器、绝不提交仓库。`.env*` 已在 `.gitignore` 中。

## 数据分层约定（强约束）

- **Postgres 只存结构化数据**：用户资料、动态正文、图片引用路径（`storage_path`）、meta JSONB。
- **重资产（图片原图二进制）一律存 Storage**，数据库只存引用路径，不存二进制。
- 目的：保护数据库体积（免费层约 500MB）。

完整数据模型说明见 [docs/data-model.md](docs/data-model.md)。

## 常用脚本

| 命令 | 说明 |
|---|---|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 生产构建 |
| `pnpm start` | 启动生产服务 |
| `pnpm lint` | ESLint 检查 |
| `pnpm typecheck` | TypeScript 类型检查 |
| `pnpm format` | Prettier 格式化 |
| `pnpm format:check` | 检查格式（不修改） |
| `pnpm test` | 运行测试 |
| `pnpm test:watch` | 监听模式运行测试 |

## Demo 部署说明

1. 在 Supabase 项目中执行 `supabase/migrations` 下的迁移，确认 `profiles`、`posts`、`post_images` 和 `images` bucket 已创建。
2. 在 Supabase Auth 中启用 Email provider，并保留邮箱验证；Google provider 可按需配置。
3. 在 Vercel 项目环境变量中配置：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL`
4. 将 `NEXT_PUBLIC_SITE_URL` 设置为部署后的站点地址，并把 Supabase Auth 回调地址配置为：
   - `https://your-domain.example/auth/callback`
5. 部署前运行：

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

> 当前是 demo 验证阶段。正式面向国内用户运营前，需要完成 ICP 备案，并将数据库、对象存储、登录与内容审核迁移到合规的国内云方案。

## 目录结构

```
src/
├─ app/                # 路由与页面（App Router）
├─ components/         # UI 组件（含 shadcn/ui）
├─ lib/
│  ├─ supabase/        # server / browser 客户端
│  ├─ domain/          # 领域逻辑（auth/profile/post/image/moderation）
│  └─ validation/      # zod 校验 schema
└─ types/              # 共享类型（含 Supabase 生成类型）

supabase/migrations/   # 数据库迁移（建表 + RLS + 触发器）
openspec/              # 规格驱动文档（proposal/specs/design/tasks）
```

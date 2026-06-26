import Link from "next/link";

import { AuthForm } from "../AuthForm";
import { registerAction } from "../actions";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7f3ea_0%,#e8decb_100%)] px-5 py-10 text-stone-950">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-5xl overflow-hidden border border-stone-900/10 bg-white/70 shadow-[0_24px_80px_rgba(52,42,28,0.14)] backdrop-blur lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="bg-[#202c22] p-8 text-stone-50 sm:p-10">
          <p className="text-xs uppercase tracking-[0.28em] text-stone-300">CRMT</p>
          <h1 className="mt-6 font-[family-name:var(--font-serif)] text-4xl leading-tight">
            给下一次出发，留一个干净的起点。
          </h1>
          <p className="mt-5 text-sm leading-7 text-stone-300">
            注册后需要先完成邮箱验证，再登录发布内容。这个流程慢一点，但账号状态会更清楚。
          </p>
        </aside>

        <div className="flex flex-col justify-center p-8 sm:p-10">
          <div>
            <p className="text-sm text-stone-500">邮箱密码注册</p>
            <h2 className="mt-2 text-2xl font-semibold">创建账号</h2>
            <AuthForm action={registerAction} buttonLabel="注册" />
            <p className="mt-6 text-sm text-stone-600">
              已经有账号？{" "}
              <Link className="font-medium text-stone-950 underline underline-offset-4" href="/auth/login">
                去登录
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

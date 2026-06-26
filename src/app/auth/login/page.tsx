import Link from "next/link";

import { AuthForm } from "../AuthForm";
import { googleLoginAction, loginAction } from "../actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    redirect?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, redirect } = await searchParams;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7f3ea_0%,#e8decb_100%)] px-5 py-10 text-stone-950">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-5xl overflow-hidden border border-stone-900/10 bg-white/70 shadow-[0_24px_80px_rgba(52,42,28,0.14)] backdrop-blur lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="bg-[#202c22] p-8 text-stone-50 sm:p-10">
          <p className="text-xs uppercase tracking-[0.28em] text-stone-300">CRMT</p>
          <h1 className="mt-6 font-[family-name:var(--font-serif)] text-4xl leading-tight">
            回到山路上，也回到你的记录里。
          </h1>
          <p className="mt-5 text-sm leading-7 text-stone-300">
            登录后可以发布动态、编辑资料，并继续完善属于自己的徒步内容流。
          </p>
        </aside>

        <div className="flex flex-col justify-center p-8 sm:p-10">
          <div>
            <p className="text-sm text-stone-500">邮箱密码登录</p>
            <h2 className="mt-2 text-2xl font-semibold">欢迎回来</h2>
            <AuthForm action={loginAction} buttonLabel="登录" defaultMessage={error} redirectTo={redirect} />
            <form action={googleLoginAction} className="mt-4">
              <input type="hidden" name="redirectTo" value={redirect ?? "/"} />
              <button
                className="inline-flex h-11 w-full items-center justify-center rounded-full border border-stone-300 bg-white/70 px-4 text-sm font-medium text-stone-900 transition hover:bg-white"
                type="submit"
              >
                使用 Google 登录
              </button>
            </form>
            <p className="mt-6 text-sm text-stone-600">
              还没有账号？{" "}
              <Link className="font-medium text-stone-950 underline underline-offset-4" href="/auth/register">
                注册一个
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

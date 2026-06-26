import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/domain/auth";
import { getLoginRedirectPath } from "@/lib/domain/navigation";

import { PostForm } from "./PostForm";

export default async function NewPostPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(getLoginRedirectPath("/posts/new"));
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7f3ea_0%,#e8decb_100%)] px-5 py-10 text-stone-950">
      <section className="mx-auto w-full max-w-4xl border border-stone-900/10 bg-white/72 p-8 shadow-[0_24px_80px_rgba(52,42,28,0.12)] backdrop-blur sm:p-10">
        <p className="text-xs uppercase tracking-[0.24em] text-stone-500">New post</p>
        <h1 className="mt-3 font-[family-name:var(--font-serif)] text-4xl leading-tight">发布一条徒步动态</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-600">
          内容可以只有文字，也可以只有图片。越具体的路况、时间和体感，越容易帮到后来的人。
        </p>
        <PostForm />
      </section>
    </main>
  );
}

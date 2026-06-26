import Link from "next/link";
import { ArrowRight, Mountain, Plus } from "lucide-react";

import { listPosts } from "@/lib/domain/post";

export default async function Home() {
  const posts = await listPosts();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(121,149,97,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(165,122,72,0.12),_transparent_28%),linear-gradient(180deg,#f7f3ea_0%,#efe7d8_52%,#e3dac8_100%)] text-stone-950">
      <section className="mx-auto w-full max-w-6xl px-5 py-5 sm:px-6 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-stone-300/80 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center border border-stone-900/10 bg-white/70 shadow-sm">
              <Mountain className="h-5 w-5 text-stone-800" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-stone-500">CRMT</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">徒步动态流</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
                看路线、路况、装备和那些让人想出门的瞬间。
              </p>
            </div>
          </div>

          <Link
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-stone-950 px-4 text-sm font-medium text-stone-50 transition hover:bg-stone-800"
            href="/posts/new"
          >
            <Plus className="h-4 w-4" />
            发布动态
          </Link>
        </header>

        {posts.length === 0 ? (
          <section className="mt-6 border border-stone-900/10 bg-[#202c22] p-8 text-stone-50 shadow-[0_28px_90px_rgba(32,44,34,0.22)] sm:p-10">
            <p className="text-xs uppercase tracking-[0.24em] text-stone-300">Empty feed</p>
            <h2 className="mt-4 max-w-3xl font-[family-name:var(--font-serif)] text-4xl leading-tight sm:text-5xl">
              这里还没有动态，第一条山路记录可以从你开始。
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-stone-300">
              发一段路线体感，或者先传几张照片。MVP 阶段我们先验证内容是否有人愿意看、愿意发。
            </p>
            <Link
              className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-stone-50 px-5 text-sm font-medium text-stone-950"
              href="/posts/new"
            >
              发布第一条
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        ) : (
          <section className="mt-6 grid gap-5">
            {posts.map((post) => {
              const firstImage = post.images[0];

              return (
                <Link
                  key={post.id}
                  className="grid gap-5 border border-stone-900/10 bg-white/75 p-5 shadow-sm backdrop-blur transition hover:bg-white md:grid-cols-[1fr_220px]"
                  href={`/posts/${post.id}`}
                >
                  <article>
                    <p className="text-sm text-stone-500">
                      {post.author?.nickname ?? "徒步者"} · {new Date(post.createdAt).toLocaleString("zh-CN")}
                    </p>
                    <h2 className="mt-3 text-xl font-semibold leading-8">{post.summary || "图片动态"}</h2>
                    <p className="mt-4 text-xs uppercase tracking-[0.18em] text-stone-500">
                      {post.images.length} 张图片
                    </p>
                  </article>
                  <div className="flex min-h-40 items-center justify-center bg-stone-200 text-sm text-stone-500">
                    {firstImage ? firstImage.storagePath : "无图片"}
                  </div>
                </Link>
              );
            })}
          </section>
        )}
      </section>
    </main>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";

import { getProfile } from "@/lib/domain/profile";
import { listMyPosts } from "@/lib/domain/post";

type UserPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function UserPage({ params }: UserPageProps) {
  const { id } = await params;
  const [profile, posts] = await Promise.all([getProfile(id), listMyPosts(id)]);

  if (!profile) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7f3ea_0%,#e8decb_100%)] px-5 py-10 text-stone-950">
      <section className="mx-auto w-full max-w-5xl">
        <header className="border border-stone-900/10 bg-white/76 p-8 shadow-sm backdrop-blur">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Hiker</p>
          <h1 className="mt-3 text-3xl font-semibold">{profile.nickname}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">{profile.bio || "这个人还没有写简介。"}</p>
        </header>

        <section className="mt-6 grid gap-4">
          {posts.length === 0 ? (
            <div className="border border-stone-900/10 bg-white/76 p-8 text-sm text-stone-600">暂无动态。</div>
          ) : (
            posts.map((post) => (
              <Link
                key={post.id}
                className="border border-stone-900/10 bg-white/76 p-5 shadow-sm backdrop-blur transition hover:bg-white"
                href={`/posts/${post.id}`}
              >
                <p className="text-sm text-stone-500">{new Date(post.createdAt).toLocaleString("zh-CN")}</p>
                <h2 className="mt-3 text-lg font-semibold leading-7">{post.summary || "图片动态"}</h2>
              </Link>
            ))
          )}
        </section>
      </section>
    </main>
  );
}

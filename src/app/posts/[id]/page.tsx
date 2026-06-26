import Link from "next/link";
import { notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/domain/auth";
import { getPost } from "@/lib/domain/post";

import { deletePostAction } from "../actions";

type PostDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;
  const [post, user] = await Promise.all([getPost(id), getCurrentUser()]);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7f3ea_0%,#e8decb_100%)] px-5 py-10 text-stone-950">
      <article className="mx-auto w-full max-w-4xl border border-stone-900/10 bg-white/76 p-8 shadow-[0_24px_80px_rgba(52,42,28,0.12)] backdrop-blur sm:p-10">
        <Link className="text-sm font-medium text-stone-600 underline underline-offset-4" href="/">
          返回动态流
        </Link>
        <header className="mt-8 border-b border-stone-200 pb-6">
          <p className="text-sm text-stone-500">
            {post.author?.nickname ?? "徒步者"} · {new Date(post.createdAt).toLocaleString("zh-CN")}
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-serif)] text-4xl leading-tight">
            {post.summary || "图片动态"}
          </h1>
        </header>

        {post.body ? <p className="mt-8 whitespace-pre-wrap text-base leading-8 text-stone-800">{post.body}</p> : null}

        {post.images.length > 0 ? (
          <div className="mt-8 grid gap-4">
            {post.images.map((image) => (
              <div key={image.id} className="flex min-h-64 items-center justify-center bg-stone-200 text-sm text-stone-500">
                {image.storagePath}
              </div>
            ))}
          </div>
        ) : null}

        {user?.id === post.authorId ? (
          <form action={deletePostAction} className="mt-8 border-t border-stone-200 pt-6">
            <input type="hidden" name="id" value={post.id} />
            <button
              className="inline-flex h-10 items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 text-sm font-medium text-red-700 transition hover:bg-red-100"
              type="submit"
            >
              删除这条动态
            </button>
          </form>
        ) : null}
      </article>
    </main>
  );
}

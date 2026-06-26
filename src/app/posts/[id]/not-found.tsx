import Link from "next/link";

export default function PostNotFound() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7f3ea_0%,#e8decb_100%)] px-5 py-10 text-stone-950">
      <section className="mx-auto w-full max-w-3xl border border-stone-900/10 bg-white/76 p-8 text-center shadow-[0_24px_80px_rgba(52,42,28,0.12)] backdrop-blur sm:p-10">
        <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Not found</p>
        <h1 className="mt-4 text-3xl font-semibold">内容不存在</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">这条动态可能已被删除，或者链接不正确。</p>
        <Link
          className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-stone-950 px-5 text-sm font-medium text-stone-50"
          href="/"
        >
          回到动态流
        </Link>
      </section>
    </main>
  );
}

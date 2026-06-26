export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f7f3ea_0%,#e8decb_100%)] px-5 py-10 text-stone-950">
      <section className="mx-auto w-full max-w-3xl border border-stone-900/10 bg-white/76 p-8 shadow-sm backdrop-blur sm:p-10">
        <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Terms</p>
        <h1 className="mt-3 text-3xl font-semibold">服务条款占位</h1>
        <div className="mt-6 space-y-4 text-sm leading-7 text-stone-700">
          <p>本页面为 demo 阶段占位内容，用于明确后续正式上线前需要补齐的用户协议、隐私政策与内容规范。</p>
          <p>用户发布内容应与徒步、户外记录、路线经验或相关装备经验有关，不应发布违法、侵权或明显与社区主题无关的内容。</p>
          <p>正式上线前需要补充完整法律文本、内容审核规则、举报处理流程以及数据删除说明。</p>
        </div>
      </section>
    </main>
  );
}

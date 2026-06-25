import { ArrowRight, Compass, Heart, MessageCircleMore, Mountain, Sparkles } from "lucide-react";

const highlights = [
  {
    title: "内容先行",
    text: "先把帖子流、封面图和短评交互打透，验证社区是否会自然生长。",
    icon: Mountain,
  },
  {
    title: "轻互动",
    text: "点赞、评论、收藏与分享都做得直接，不堆复杂社交关系。",
    icon: MessageCircleMore,
  },
  {
    title: "路线语境",
    text: "按城市、天气和强度组织内容，让每条动态都有可读性。",
    icon: Compass,
  },
];

const posts = [
  {
    title: "雨后穿越云岭线",
    meta: "南京 · 6 人同行 · 2 小时前",
    desc: "山脊风很大，雾散得快，适合想找一条不太难但有风景的线。",
    stats: "128 赞 · 24 条评论",
  },
  {
    title: "第一次独自爬山的装备清单",
    meta: "杭州 · 1 小时前",
    desc: "把水、头灯、补给和保暖层列成一张最小清单，避免背太多。",
    stats: "96 赞 · 18 条评论",
  },
  {
    title: "周末半日徒步路线整理",
    meta: "上海 · 昨天",
    desc: "适合通勤后恢复状态的短线路，节奏稳定，回程交通也方便。",
    stats: "74 赞 · 12 条评论",
  },
];

const stats = [
  { label: "本周新增动态", value: "48" },
  { label: "活跃城市", value: "12" },
  { label: "收藏转发率", value: "18%" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(121,149,97,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(165,122,72,0.12),_transparent_28%),linear-gradient(180deg,#f7f3ea_0%,#efe7d8_52%,#e3dac8_100%)] text-stone-950">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-6 lg:px-10">
        <header className="flex items-center justify-between border-b border-stone-300/80 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-stone-500">CRMT</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">徒步社群 MVP</h1>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full border border-stone-900/10 bg-white/70 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur transition hover:bg-white">
            <Sparkles className="h-4 w-4" />
            预览内容流
          </button>
        </header>

        <div className="grid flex-1 gap-6 py-6 lg:grid-cols-[1.25fr_0.75fr]">
          <section className="relative overflow-hidden border border-stone-900/10 bg-[#202c22] p-7 text-stone-50 shadow-[0_28px_90px_rgba(32,44,34,0.26)] sm:p-10">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_top_right,rgba(204,226,183,0.2),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.06),transparent_24%)]" />
            <div className="relative flex h-full flex-col justify-between gap-10">
              <div className="max-w-2xl">
                <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs uppercase tracking-[0.24em] text-stone-200">
                  <Heart className="h-3.5 w-3.5" />
                  社区验证阶段
                </p>
                <h2 className="max-w-3xl font-[family-name:var(--font-serif)] text-4xl leading-tight tracking-tight text-stone-50 sm:text-5xl lg:text-6xl">
                  先做一个能让人停下来看的徒步内容首页。
                </h2>
                <p className="mt-5 max-w-xl text-sm leading-7 text-stone-300 sm:text-base">
                  先把内容密度、图文结构和互动入口做好，再往登录、发帖和真实数据流推进。
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {highlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <article key={item.title} className="border border-white/10 bg-white/6 p-4 backdrop-blur-sm">
                      <Icon className="mb-3 h-5 w-5 text-[#d8e8c8]" />
                      <h3 className="text-sm font-semibold">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-stone-300">{item.text}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          <aside className="flex flex-col gap-6">
            <section className="border border-stone-900/10 bg-white/78 p-6 shadow-sm backdrop-blur">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Overview</p>
                  <h2 className="mt-2 text-lg font-semibold">内容状态</h2>
                </div>
                <span className="text-sm text-stone-500">实时示意</span>
              </div>
              <div className="mt-5 grid gap-3">
                {stats.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between border border-stone-200 bg-stone-50/80 px-4 py-3"
                  >
                    <span className="text-sm text-stone-600">{item.label}</span>
                    <strong className="text-lg font-semibold text-stone-950">{item.value}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-stone-900/10 bg-white/78 p-6 shadow-sm backdrop-blur">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">热门动态</h2>
                <span className="text-sm text-stone-500">3 条示例</span>
              </div>
              <div className="mt-4 space-y-4">
                {posts.map((post) => (
                  <article key={post.title} className="border-t border-stone-200 pt-4 first:border-0 first:pt-0">
                    <p className="text-sm text-stone-500">{post.meta}</p>
                    <h3 className="mt-1 text-base font-semibold">{post.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-700">{post.desc}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-stone-500">{post.stats}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="border border-stone-900/10 bg-stone-950 p-6 text-stone-50 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Next step</p>
              <h2 className="mt-3 text-2xl font-semibold">往真实内容流和发布入口推进</h2>
              <p className="mt-3 text-sm leading-6 text-stone-300">
                现在首页已经具备产品气质，可以直接接入帖子列表、发布按钮和登录态。
              </p>
              <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-stone-50 px-4 py-2 text-sm font-medium text-stone-950">
                继续搭建
                <ArrowRight className="h-4 w-4" />
              </button>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

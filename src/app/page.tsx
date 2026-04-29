import Link from "next/link";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { SiteShell } from "@/components/site-shell";
import { stripHTML, formatDate } from "@/lib/utils";

export const revalidate = 60;

export default async function Home() {
  const [settings, hotProducts, latestProducts, latestNews, brands] =
    await Promise.all([
      getSettings(),
      db.product.findMany({
        where: { visible: true, isHot: true },
        orderBy: { sort: "desc" },
        take: 8,
        include: { category: true },
      }),
      db.product.findMany({
        where: { visible: true },
        orderBy: { publishedAt: "desc" },
        take: 12,
        include: { category: true },
      }),
      db.news.findMany({
        where: { visible: true },
        orderBy: { publishedAt: "desc" },
        take: 6,
      }),
      db.category.findMany({
        where: { isBrand: true, visible: true },
        orderBy: { sort: "asc" },
        take: 24,
      }),
    ]);

  const showcase = hotProducts.length ? hotProducts : latestProducts.slice(0, 8);

  return (
    <SiteShell>
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-primary to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block px-3 py-1 mb-4 bg-accent/20 text-accent text-xs rounded-full">
              ★ 30+ 国际品牌授权代理
            </div>
            <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
              {settings.hero_title}
              <br />
              <span className="text-accent">国际原装</span>
            </h1>
            <p className="text-lg text-slate-200 mb-8 leading-relaxed">
              {settings.hero_desc}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="px-6 py-3 bg-accent text-white rounded font-semibold hover:bg-orange-600 transition"
              >
                浏览产品
              </Link>
              <Link
                href="/inquiry"
                className="px-6 py-3 border-2 border-white/30 rounded font-semibold hover:bg-white/10 transition"
              >
                立即询价
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {showcase.slice(0, 4).map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="bg-white/10 backdrop-blur rounded-lg overflow-hidden hover:bg-white/20 transition"
              >
                <div className="aspect-square bg-white">
                  {p.cover ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={p.cover}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 text-xs">
                      暂无图
                    </div>
                  )}
                </div>
                <div className="p-3 text-sm font-medium truncate">{p.title}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 卖点 */}
      <section className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            ["原厂正品", "全部源头进口，可验真伪"],
            ["规格齐全", "5000+ 型号现货库存"],
            ["选型专家", "工程师 1V1 技术支持"],
            ["快速交付", "现货 24 小时发货"],
          ].map(([t, d]) => (
            <div key={t}>
              <div className="text-2xl font-black text-primary mb-1">{t}</div>
              <div className="text-sm text-slate-500">{d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 品牌墙 */}
      <section className="bg-muted">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-2">代理品牌</h2>
          <p className="text-slate-500 mb-6">授权代理国际一线密封件制造商</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {brands.map((b) => (
              <Link
                key={b.id}
                href={`/products?brand=${b.slug}`}
                className="bg-white rounded-lg px-4 py-5 text-center hover:shadow-md transition border border-border"
              >
                <div className="font-bold text-slate-800">{b.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 推荐产品 */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-2xl font-bold">推荐产品</h2>
            <Link href="/products" className="text-accent text-sm">
              查看全部 →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {showcase.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="group rounded-lg overflow-hidden border border-border hover:border-accent hover:shadow-md transition"
              >
                <div className="aspect-square bg-muted overflow-hidden">
                  {p.cover ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={p.cover}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                      暂无图
                    </div>
                  )}
                </div>
                <div className="p-3">
                  {p.category ? (
                    <div className="text-xs text-accent mb-1">
                      {p.category.name}
                    </div>
                  ) : null}
                  <div className="font-medium text-sm truncate group-hover:text-primary">
                    {p.title}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 新闻 */}
      <section className="bg-muted">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-2xl font-bold">新闻动态</h2>
            <Link href="/news" className="text-accent text-sm">
              查看全部 →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {latestNews.map((n) => (
              <Link
                key={n.id}
                href={`/news/${n.slug}`}
                className="bg-white p-5 rounded-lg flex justify-between items-start gap-4 hover:shadow-md transition"
              >
                <div className="min-w-0">
                  <h3 className="font-semibold mb-1 line-clamp-1">{n.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2">
                    {stripHTML(n.summary || n.content)}
                  </p>
                </div>
                <div className="text-xs text-slate-400 shrink-0">
                  {formatDate(n.publishedAt)}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

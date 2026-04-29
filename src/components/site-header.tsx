import Link from "next/link";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";

const TOP_NAV = [
  { href: "/", label: "首页" },
  { href: "/products", label: "产品中心" },
  { href: "/news", label: "新闻动态" },
  { href: "/about", label: "关于我们" },
  { href: "/company", label: "公司简介" },
  { href: "/culture", label: "企业文化" },
  { href: "/jobs", label: "招聘信息" },
  { href: "/contact", label: "联系我们" },
];

export async function SiteHeader() {
  const [settings, brands] = await Promise.all([
    getSettings(),
    db.category.findMany({
      where: { isBrand: true, visible: true },
      orderBy: { sort: "asc" },
      select: { slug: true, name: true },
      take: 30,
    }),
  ]);

  return (
    <header className="border-b border-border bg-white sticky top-0 z-40">
      <div className="bg-slate-900 text-slate-300 text-xs">
        <div className="max-w-7xl mx-auto px-4 h-9 flex items-center justify-between">
          <span>{settings.site_subtitle}</span>
          <span>
            服务热线：
            <span className="text-accent font-semibold">
              {settings.contact_phone}
            </span>
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center gap-8">
        <Link href="/" className="flex items-baseline gap-3">
          <span className="text-3xl font-black tracking-tight text-primary">
            KASTAS
          </span>
          <span className="text-sm text-slate-500">加斯达密封件</span>
        </Link>

        <nav className="ml-auto flex items-center gap-1 text-sm">
          {TOP_NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="px-3 py-2 rounded hover:bg-muted hover:text-primary transition"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>

      {brands.length > 0 ? (
        <div className="bg-muted border-t border-border">
          <div className="max-w-7xl mx-auto px-4 py-2 text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
            <span className="text-slate-400">代理品牌：</span>
            {brands.slice(0, 20).map((b) => (
              <Link
                key={b.slug}
                href={`/products?brand=${b.slug}`}
                className="hover:text-accent"
              >
                {b.name}
              </Link>
            ))}
            {brands.length > 20 ? (
              <Link href="/products" className="text-accent">
                查看全部 →
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}

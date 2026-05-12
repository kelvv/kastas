import Link from "next/link";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { HeaderNav } from "./header-nav";

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

  const phone = settings.contact_phone ?? "";
  const telHref = phone ? `tel:${phone.replace(/[^0-9+]/g, "")}` : "";

  return (
    <header className="border-b border-border bg-white sticky top-0 z-40">
      {/* 顶栏: PC 双栏(slogan + 电话), 移动端只显电话且可点拨 */}
      <div className="bg-slate-900 text-slate-300 text-xs">
        <div className="max-w-7xl mx-auto px-4 h-9 flex items-center justify-between">
          <span className="hidden md:inline">{settings.site_subtitle}</span>
          {phone ? (
            <a
              href={telHref}
              className="ml-auto md:ml-0 flex items-center gap-1 hover:text-white"
            >
              <span className="hidden md:inline">服务热线：</span>
              <span className="md:hidden">📞</span>
              <span className="text-accent font-semibold">{phone}</span>
            </a>
          ) : null}
        </div>
      </div>

      {/* Logo + 导航 */}
      <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center gap-4 md:gap-8">
        <Link href="/" className="flex items-baseline gap-2 md:gap-3 shrink-0">
          <span className="text-2xl md:text-3xl font-black tracking-tight text-primary">
            KASTAS
          </span>
          <span className="hidden sm:inline text-sm text-slate-500 whitespace-nowrap">
            加斯达密封件
          </span>
        </Link>

        <HeaderNav items={TOP_NAV} brands={brands} phone={phone} />
      </div>

      {/* 代理品牌横排: 仅 PC 显示, 移动端走汉堡菜单里的"代理品牌"折叠区 */}
      {brands.length > 0 ? (
        <div className="hidden md:block bg-muted border-t border-border">
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

import Link from "next/link";
import { db } from "@/lib/db";
import { SiteShell } from "@/components/site-shell";

export const revalidate = 60;

interface Props {
  searchParams: Promise<{ brand?: string; q?: string; page?: string }>;
}

const PAGE_SIZE = 24;

export default async function ProductsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const where: { visible: boolean; categoryId?: number; title?: { contains: string; mode: "insensitive" } } = {
    visible: true,
  };

  if (sp.brand) {
    const cat = await db.category.findUnique({ where: { slug: sp.brand } });
    if (cat) where.categoryId = cat.id;
  }
  if (sp.q) {
    where.title = { contains: sp.q, mode: "insensitive" };
  }

  const [brands, total, products, currentBrand] = await Promise.all([
    db.category.findMany({
      where: { isBrand: true, visible: true },
      orderBy: { sort: "asc" },
    }),
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy: [{ isTop: "desc" }, { sort: "desc" }, { id: "desc" }],
      include: { category: true },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    sp.brand
      ? db.category.findUnique({ where: { slug: sp.brand } })
      : Promise.resolve(null),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <SiteShell>
      <div className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold">
            {currentBrand ? currentBrand.name : "产品中心"}
          </h1>
          <p className="text-slate-300 mt-2">
            {currentBrand
              ? `${currentBrand.name} 系列产品`
              : "全部进口工业密封件"}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-[240px_1fr] gap-6">
        <aside className="space-y-1">
          <div className="font-semibold mb-2">品牌分类</div>
          <Link
            href="/products"
            className={`block px-3 py-2 rounded text-sm ${
              !sp.brand
                ? "bg-primary text-white"
                : "hover:bg-muted text-slate-700"
            }`}
          >
            全部品牌
          </Link>
          {brands.map((b) => (
            <Link
              key={b.id}
              href={`/products?brand=${b.slug}`}
              className={`block px-3 py-2 rounded text-sm ${
                sp.brand === b.slug
                  ? "bg-primary text-white"
                  : "hover:bg-muted text-slate-700"
              }`}
            >
              {b.name}
            </Link>
          ))}
        </aside>

        <div>
          <div className="text-sm text-slate-500 mb-4">
            共 <span className="font-semibold text-slate-900">{total}</span> 件商品
          </div>
          {products.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              暂无产品
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    className="group border border-border rounded-lg overflow-hidden hover:border-accent hover:shadow-md transition"
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
                      <div className="font-medium text-sm line-clamp-2 group-hover:text-primary">
                        {p.title}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {totalPages > 1 ? (
                <div className="flex justify-center gap-1 mt-8">
                  {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                    const p = i + 1;
                    const params = new URLSearchParams();
                    if (sp.brand) params.set("brand", sp.brand);
                    if (sp.q) params.set("q", sp.q);
                    if (p > 1) params.set("page", String(p));
                    const href = `/products${params.toString() ? "?" + params : ""}`;
                    return (
                      <Link
                        key={p}
                        href={href}
                        className={`px-3 py-2 rounded text-sm ${
                          p === page
                            ? "bg-primary text-white"
                            : "border border-border hover:border-primary"
                        }`}
                      >
                        {p}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </SiteShell>
  );
}

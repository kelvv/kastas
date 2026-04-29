import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { SiteShell } from "@/components/site-shell";
import { stripHTML, formatDate } from "@/lib/utils";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await db.product.findUnique({ where: { slug } });
  if (!p) return { title: "产品不存在" };
  return {
    title: p.seoTitle || p.title,
    description: p.seoDesc || stripHTML(p.summary || p.content),
    keywords: p.seoKeywords || undefined,
  };
}

export default async function ProductDetail({ params }: Props) {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!product || !product.visible) notFound();

  // 同分类相关产品
  const related = product.categoryId
    ? await db.product.findMany({
        where: {
          visible: true,
          categoryId: product.categoryId,
          id: { not: product.id },
        },
        orderBy: { id: "desc" },
        take: 8,
      })
    : [];

  // 异步增加点击数（不阻塞）
  db.product
    .update({ where: { id: product.id }, data: { click: { increment: 1 } } })
    .catch(() => {});

  return (
    <SiteShell>
      <div className="bg-muted border-b border-border py-3">
        <div className="max-w-7xl mx-auto px-4 text-xs text-slate-500 flex gap-2">
          <Link href="/" className="hover:text-primary">
            首页
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary">
            产品中心
          </Link>
          {product.category ? (
            <>
              <span>/</span>
              <Link
                href={`/products?brand=${product.category.slug}`}
                className="hover:text-primary"
              >
                {product.category.name}
              </Link>
            </>
          ) : null}
          <span>/</span>
          <span className="text-slate-700 truncate">{product.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid md:grid-cols-[1fr_1.4fr] gap-8">
        <div className="bg-white rounded-lg border border-border overflow-hidden">
          {product.cover ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={product.cover}
              alt={product.title}
              className="w-full aspect-square object-contain"
            />
          ) : (
            <div className="aspect-square flex items-center justify-center text-slate-400">
              暂无图片
            </div>
          )}
        </div>
        <div>
          {product.category ? (
            <div className="text-sm text-accent font-medium mb-2">
              {product.category.name}
            </div>
          ) : null}
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
          {product.summary ? (
            <p className="text-slate-600 mb-6 leading-relaxed">
              {stripHTML(product.summary, 500)}
            </p>
          ) : null}
          <div className="flex gap-4 mb-6">
            <Link
              href={`/inquiry?product=${product.id}`}
              className="px-6 py-3 bg-accent text-white rounded font-semibold hover:bg-orange-600 transition"
            >
              立即询价
            </Link>
          </div>
          <div className="text-xs text-slate-400 space-x-4">
            <span>更新：{formatDate(product.updatedAt)}</span>
            <span>浏览：{product.click}</span>
          </div>
        </div>
      </div>

      {product.content ? (
        <section className="bg-white border-t border-border">
          <div className="max-w-7xl mx-auto px-4 py-10">
            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-border">
              产品详情
            </h2>
            <div
              className="legacy-html prose max-w-none"
              dangerouslySetInnerHTML={{ __html: product.content }}
            />
          </div>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="bg-muted">
          <div className="max-w-7xl mx-auto px-4 py-10">
            <h2 className="text-xl font-bold mb-4">同类产品</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/products/${r.slug}`}
                  className="bg-white border border-border rounded-lg overflow-hidden hover:shadow-md transition"
                >
                  <div className="aspect-square bg-white">
                    {r.cover ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={r.cover}
                        alt={r.title}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="p-3 text-sm font-medium truncate">
                    {r.title}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </SiteShell>
  );
}

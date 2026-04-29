import Link from "next/link";
import { db } from "@/lib/db";
import { SiteShell } from "@/components/site-shell";
import { stripHTML, formatDate } from "@/lib/utils";

export const revalidate = 60;

interface Props {
  searchParams: Promise<{ page?: string }>;
}

const PAGE_SIZE = 15;

export default async function NewsList({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const [total, items] = await Promise.all([
    db.news.count({ where: { visible: true } }),
    db.news.findMany({
      where: { visible: true },
      orderBy: [{ isTop: "desc" }, { publishedAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <SiteShell>
      <div className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold">新闻动态</h1>
          <p className="text-slate-300 mt-2">了解公司最新动态与行业资讯</p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {items.length === 0 ? (
          <div className="text-center py-20 text-slate-400">暂无新闻</div>
        ) : (
          <div className="space-y-3">
            {items.map((n) => (
              <Link
                key={n.id}
                href={`/news/${n.slug}`}
                className="block bg-white border border-border rounded-lg p-5 hover:border-accent hover:shadow-md transition flex gap-4"
              >
                {n.cover ? (
                  <div className="w-32 h-24 bg-muted rounded overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={n.cover}
                      alt={n.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : null}
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-lg mb-1 line-clamp-1">
                    {n.title}
                  </h2>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-2">
                    {stripHTML(n.summary || n.content)}
                  </p>
                  <div className="text-xs text-slate-400">
                    {formatDate(n.publishedAt)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 ? (
          <div className="flex justify-center gap-1 mt-8">
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
              const p = i + 1;
              return (
                <Link
                  key={p}
                  href={p === 1 ? "/news" : `/news?page=${p}`}
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
      </div>
    </SiteShell>
  );
}

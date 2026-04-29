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
  const n = await db.news.findUnique({ where: { slug } });
  if (!n) return { title: "新闻不存在" };
  return {
    title: n.seoTitle || n.title,
    description: n.seoDesc || stripHTML(n.summary || n.content, 200),
    keywords: n.seoKeywords || undefined,
  };
}

export default async function NewsDetail({ params }: Props) {
  const { slug } = await params;
  const news = await db.news.findUnique({ where: { slug } });
  if (!news || !news.visible) notFound();

  db.news
    .update({ where: { id: news.id }, data: { click: { increment: 1 } } })
    .catch(() => {});

  return (
    <SiteShell>
      <article className="max-w-3xl mx-auto px-4 py-10">
        <Link
          href="/news"
          className="text-sm text-accent hover:underline"
        >
          ← 返回新闻列表
        </Link>
        <h1 className="text-3xl font-bold mt-4 mb-3">{news.title}</h1>
        <div className="text-sm text-slate-400 mb-6 pb-6 border-b border-border">
          {formatDate(news.publishedAt)} · 浏览 {news.click}
        </div>
        {news.content ? (
          <div
            className="legacy-html prose max-w-none"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
        ) : news.summary ? (
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
            {news.summary}
          </p>
        ) : (
          <p className="text-slate-400">暂无内容</p>
        )}
      </article>
    </SiteShell>
  );
}

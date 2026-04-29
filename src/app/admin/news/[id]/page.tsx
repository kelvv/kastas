import { db } from "@/lib/db";
import { AdminShell } from "@/components/admin-shell";
import { NewsForm } from "@/components/news-form";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditNewsPage({ params }: Props) {
  const { id } = await params;
  const n = await db.news.findUnique({ where: { id: parseInt(id, 10) } });
  if (!n) notFound();
  return (
    <AdminShell title={`编辑新闻 · ${n.title}`}>
      <NewsForm
        newsId={n.id}
        initial={{
          title: n.title,
          slug: n.slug,
          cover: n.cover || "",
          summary: n.summary || "",
          content: n.content || "",
          isTop: n.isTop,
          visible: n.visible,
          seoTitle: n.seoTitle || "",
          seoKeywords: n.seoKeywords || "",
          seoDesc: n.seoDesc || "",
        }}
      />
    </AdminShell>
  );
}

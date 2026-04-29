import { db } from "@/lib/db";
import { SiteShell } from "@/components/site-shell";
import { notFound } from "next/navigation";

export async function PageView({ slug }: { slug: string }) {
  const page = await db.page.findUnique({ where: { slug } });
  if (!page) notFound();
  return (
    <SiteShell>
      <div className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold">{page.title}</h1>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-10">
        {page.content ? (
          <div
            className="legacy-html prose max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        ) : (
          <p className="text-slate-400">暂无内容</p>
        )}
      </div>
    </SiteShell>
  );
}

import Link from "next/link";
import { db } from "@/lib/db";
import { AdminShell } from "@/components/admin-shell";
import { formatDate } from "@/lib/utils";

const STANDARD = [
  { slug: "about", title: "关于我们" },
  { slug: "company", title: "公司简介" },
  { slug: "culture", title: "企业文化" },
  { slug: "contact", title: "联系我们" },
  { slug: "jobs", title: "招聘信息" },
];

export default async function PagesAdmin() {
  const pages = await db.page.findMany({ orderBy: { slug: "asc" } });
  const map = new Map(pages.map((p) => [p.slug, p]));
  const list = STANDARD.map((s) => ({
    slug: s.slug,
    title: map.get(s.slug)?.title || s.title,
    updatedAt: map.get(s.slug)?.updatedAt || null,
    exists: map.has(s.slug),
  }));
  return (
    <AdminShell title="单页管理">
      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-3 py-2 w-32">slug</th>
              <th className="px-3 py-2">标题</th>
              <th className="px-3 py-2 w-32">最后更新</th>
              <th className="px-3 py-2 w-32">操作</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.slug} className="border-t border-border">
                <td className="px-3 py-2 font-mono text-xs">{p.slug}</td>
                <td className="px-3 py-2 font-medium">{p.title}</td>
                <td className="px-3 py-2 text-xs text-slate-500">
                  {p.updatedAt ? formatDate(p.updatedAt) : "未创建"}
                </td>
                <td className="px-3 py-2 space-x-2">
                  <Link
                    href={`/admin/pages/${p.slug}`}
                    className="text-primary hover:underline"
                  >
                    编辑
                  </Link>
                  <Link
                    href={`/${p.slug}`}
                    target="_blank"
                    className="text-slate-500 hover:underline"
                  >
                    预览
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}

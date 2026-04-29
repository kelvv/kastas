import Link from "next/link";
import { db } from "@/lib/db";
import { AdminShell } from "@/components/admin-shell";
import { formatDate } from "@/lib/utils";

const PAGE_SIZE = 30;

interface Props {
  searchParams: Promise<{ page?: string; q?: string; cat?: string }>;
}

export default async function ProductsAdmin({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  const where: { title?: { contains: string; mode: "insensitive" }; categoryId?: number } = {};
  if (sp.q) where.title = { contains: sp.q, mode: "insensitive" };
  if (sp.cat) where.categoryId = parseInt(sp.cat, 10);

  const [total, items, categories] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where,
      orderBy: { id: "desc" },
      include: { category: true },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.category.findMany({
      where: { isBrand: true },
      orderBy: { sort: "asc" },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <AdminShell title="产品管理">
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <Link
          href="/admin/products/new"
          className="px-4 py-2 bg-primary text-white rounded text-sm hover:bg-blue-900"
        >
          + 新增产品
        </Link>
        <form className="flex gap-2 items-center ml-auto">
          <select
            name="cat"
            defaultValue={sp.cat || ""}
            className="px-3 py-2 border border-border rounded text-sm"
          >
            <option value="">全部分类</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            name="q"
            defaultValue={sp.q || ""}
            placeholder="搜索产品名"
            className="px-3 py-2 border border-border rounded text-sm w-48"
          />
          <button className="px-3 py-2 bg-slate-700 text-white rounded text-sm">
            搜索
          </button>
        </form>
      </div>

      <div className="text-sm text-slate-500 mb-3">共 {total} 条</div>

      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-3 py-2 w-16">图片</th>
              <th className="px-3 py-2">标题</th>
              <th className="px-3 py-2 w-32">分类</th>
              <th className="px-3 py-2 w-16">点击</th>
              <th className="px-3 py-2 w-16">状态</th>
              <th className="px-3 py-2 w-28">更新</th>
              <th className="px-3 py-2 w-32">操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t border-border hover:bg-slate-50">
                <td className="px-3 py-2">
                  {p.cover ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={p.cover}
                      alt=""
                      className="w-12 h-12 object-cover rounded border"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-slate-100 rounded" />
                  )}
                </td>
                <td className="px-3 py-2">
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs text-slate-400">{p.slug}</div>
                </td>
                <td className="px-3 py-2 text-slate-600">
                  {p.category?.name || "-"}
                </td>
                <td className="px-3 py-2">{p.click}</td>
                <td className="px-3 py-2">
                  {p.visible ? (
                    <span className="text-green-600">显示</span>
                  ) : (
                    <span className="text-slate-400">隐藏</span>
                  )}
                </td>
                <td className="px-3 py-2 text-slate-500 text-xs">
                  {formatDate(p.updatedAt)}
                </td>
                <td className="px-3 py-2 space-x-2">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="text-primary hover:underline"
                  >
                    编辑
                  </Link>
                  <Link
                    href={`/products/${p.slug}`}
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

      {totalPages > 1 ? (
        <div className="flex justify-center gap-1 mt-6">
          {Array.from({ length: Math.min(totalPages, 15) }, (_, i) => {
            const p = i + 1;
            const params = new URLSearchParams();
            if (sp.q) params.set("q", sp.q);
            if (sp.cat) params.set("cat", sp.cat);
            if (p > 1) params.set("page", String(p));
            const href = `/admin/products${params.toString() ? "?" + params : ""}`;
            return (
              <Link
                key={p}
                href={href}
                className={`px-3 py-1.5 rounded text-sm ${
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
    </AdminShell>
  );
}

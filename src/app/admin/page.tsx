import { db } from "@/lib/db";
import { AdminShell } from "@/components/admin-shell";
import Link from "next/link";

export default async function AdminDashboard() {
  const [productCount, newsCount, categoryCount, inquiryCount, newInquiries] =
    await Promise.all([
      db.product.count(),
      db.news.count(),
      db.category.count(),
      db.inquiry.count(),
      db.inquiry.count({ where: { status: "new" } }),
    ]);

  const stats = [
    { label: "产品数", value: productCount, href: "/admin/products" },
    { label: "新闻数", value: newsCount, href: "/admin/news" },
    { label: "分类数", value: categoryCount, href: "/admin/categories" },
    { label: "询盘总数", value: inquiryCount, href: "/admin/inquiries" },
  ];

  return (
    <AdminShell title="概览">
      {newInquiries > 0 ? (
        <Link
          href="/admin/inquiries?status=new"
          className="block bg-orange-50 border border-orange-200 text-orange-700 rounded-lg p-4 mb-6"
        >
          🔔 您有 <span className="font-bold">{newInquiries}</span> 条未处理询盘
        </Link>
      ) : null}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white border border-border rounded-lg p-5 hover:shadow-md transition"
          >
            <div className="text-xs text-slate-500">{s.label}</div>
            <div className="text-3xl font-black text-primary mt-1">{s.value}</div>
          </Link>
        ))}
      </div>

      <h2 className="text-lg font-bold mt-10 mb-3">快捷操作</h2>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/products/new"
          className="px-4 py-2 bg-primary text-white rounded text-sm hover:bg-blue-900"
        >
          + 新增产品
        </Link>
        <Link
          href="/admin/news/new"
          className="px-4 py-2 bg-primary text-white rounded text-sm hover:bg-blue-900"
        >
          + 新增新闻
        </Link>
        <Link
          href="/admin/categories"
          className="px-4 py-2 border border-border rounded text-sm hover:border-primary"
        >
          管理分类
        </Link>
        <Link
          href="/admin/settings"
          className="px-4 py-2 border border-border rounded text-sm hover:border-primary"
        >
          网站设置
        </Link>
      </div>
    </AdminShell>
  );
}

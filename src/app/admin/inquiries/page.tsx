import Link from "next/link";
import { db } from "@/lib/db";
import { AdminShell } from "@/components/admin-shell";
import { InquiriesList } from "@/components/inquiries-list";

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function InquiriesAdmin({ searchParams }: Props) {
  const sp = await searchParams;
  const where = sp.status ? { status: sp.status } : {};
  const items = await db.inquiry.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { product: { select: { title: true } } },
    take: 200,
  });

  const tabs = [
    { key: "", label: "全部" },
    { key: "new", label: "未处理" },
    { key: "read", label: "已查看" },
    { key: "replied", label: "已回复" },
    { key: "closed", label: "已关闭" },
  ];

  return (
    <AdminShell title="询盘管理">
      <div className="flex gap-2 mb-4">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.key ? `/admin/inquiries?status=${t.key}` : "/admin/inquiries"}
            className={`px-3 py-1.5 rounded text-sm ${
              (sp.status || "") === t.key
                ? "bg-primary text-white"
                : "border border-border hover:border-primary"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <InquiriesList
        initial={items.map((i) => ({
          id: i.id,
          name: i.name,
          phone: i.phone,
          email: i.email,
          company: i.company,
          message: i.message,
          status: i.status,
          productTitle: i.product?.title || null,
          createdAt: i.createdAt,
        }))}
      />
    </AdminShell>
  );
}

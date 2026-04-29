import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

const NAV = [
  ["/admin", "概览"],
  ["/admin/products", "产品管理"],
  ["/admin/categories", "分类管理"],
  ["/admin/news", "新闻管理"],
  ["/admin/pages", "单页管理"],
  ["/admin/inquiries", "询盘列表"],
  ["/admin/settings", "网站设置"],
];

export async function AdminShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const session = await getSession();
  if (!session.userId) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-56 bg-slate-900 text-slate-300 min-h-screen p-4 flex flex-col sticky top-0 self-start">
        <Link href="/admin" className="text-xl font-black text-white mb-6 px-2">
          KASTAS · 后台
        </Link>
        <nav className="space-y-1 flex-1">
          {NAV.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="block px-3 py-2 rounded text-sm hover:bg-slate-800 hover:text-white"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-800 pt-3 text-xs space-y-2">
          <div className="px-2 text-slate-400">{session.username}</div>
          <Link
            href="/"
            target="_blank"
            className="block px-2 hover:text-white"
          >
            ↗ 查看前台
          </Link>
          <form action="/api/admin/logout" method="POST">
            <button className="px-2 text-slate-400 hover:text-red-400">
              退出登录
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-8">
        {title ? (
          <h1 className="text-2xl font-bold mb-6">{title}</h1>
        ) : null}
        {children}
      </main>
    </div>
  );
}

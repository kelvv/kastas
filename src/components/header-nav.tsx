"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type NavItem = { href: string; label: string };
type Brand = { slug: string; name: string };

export function HeaderNav({
  items,
  brands,
  phone,
}: {
  items: NavItem[];
  brands: Brand[];
  phone: string;
}) {
  const [open, setOpen] = useState(false);
  const [brandsOpen, setBrandsOpen] = useState(false);

  // 抽屉打开时锁 body 滚动
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  return (
    <>
      {/* PC nav: md 及以上显示 */}
      <nav className="ml-auto hidden md:flex items-center gap-1 text-sm">
        {items.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="px-3 py-2 rounded hover:bg-muted hover:text-primary transition"
          >
            {n.label}
          </Link>
        ))}
      </nav>

      {/* 移动端汉堡按钮 */}
      <button
        type="button"
        aria-label="打开菜单"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="ml-auto md:hidden inline-flex items-center justify-center w-10 h-10 rounded hover:bg-muted text-slate-700"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </button>

      {/* 移动端抽屉 */}
      {open ? (
        <div className="md:hidden fixed inset-0 z-50">
          {/* 遮罩 */}
          <button
            type="button"
            aria-label="关闭菜单"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50"
          />
          {/* 抽屉面板 */}
          <div className="absolute top-0 right-0 h-full w-[82%] max-w-sm bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 h-14 border-b border-border">
              <span
                className="text-lg font-bold text-primary"
                style={{ fontFamily: '"Times New Roman", Times, serif' }}
              >
                KASTAS
              </span>
              <button
                type="button"
                aria-label="关闭菜单"
                onClick={() => setOpen(false)}
                className="w-10 h-10 inline-flex items-center justify-center rounded hover:bg-muted text-slate-700"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-2">
              {items.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="block px-5 py-3 text-base text-slate-800 hover:bg-muted hover:text-primary border-b border-border/50"
                >
                  {n.label}
                </Link>
              ))}

              {brands.length > 0 ? (
                <div className="border-b border-border/50">
                  <button
                    type="button"
                    onClick={() => setBrandsOpen((v) => !v)}
                    aria-expanded={brandsOpen}
                    className="w-full flex items-center justify-between px-5 py-3 text-base text-slate-800 hover:bg-muted"
                  >
                    <span>代理品牌</span>
                    <span
                      className={`transition-transform ${
                        brandsOpen ? "rotate-180" : ""
                      }`}
                    >
                      ▾
                    </span>
                  </button>
                  {brandsOpen ? (
                    <div className="px-5 pb-3 flex flex-wrap gap-x-3 gap-y-2 text-sm text-slate-600">
                      {brands.map((b) => (
                        <Link
                          key={b.slug}
                          href={`/products?brand=${b.slug}`}
                          onClick={() => setOpen(false)}
                          className="hover:text-accent"
                        >
                          {b.name}
                        </Link>
                      ))}
                      <Link
                        href="/products"
                        onClick={() => setOpen(false)}
                        className="text-accent"
                      >
                        查看全部 →
                      </Link>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </nav>

            {phone ? (
              <a
                href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                className="block bg-accent text-white text-center py-3 font-semibold"
              >
                📞 拨打 {phone}
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

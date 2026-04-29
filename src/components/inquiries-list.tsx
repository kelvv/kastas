"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";

interface Inquiry {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  company: string | null;
  message: string;
  status: string;
  productTitle: string | null;
  createdAt: Date;
}

interface Props {
  initial: Inquiry[];
}

export function InquiriesList({ initial }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(initial);

  async function setStatus(id: number, status: string) {
    setItems((list) =>
      list.map((i) => (i.id === id ? { ...i, status } : i))
    );
    await fetch(`/api/admin/inquiries/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  async function remove(id: number) {
    if (!confirm("删除此询盘？")) return;
    const res = await fetch(`/api/admin/inquiries/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((list) => list.filter((i) => i.id !== id));
      router.refresh();
    }
  }

  if (items.length === 0) {
    return (
      <div className="bg-white border border-border rounded-lg p-12 text-center text-slate-400">
        暂无询盘
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((it) => (
        <div
          key={it.id}
          className={`bg-white border rounded-lg p-4 ${
            it.status === "new" ? "border-orange-300" : "border-border"
          }`}
        >
          <div className="flex flex-wrap items-start gap-3 mb-2">
            <span className="font-bold text-base">{it.name}</span>
            {it.company ? (
              <span className="text-sm text-slate-600">{it.company}</span>
            ) : null}
            <div className="ml-auto flex items-center gap-2">
              <select
                value={it.status}
                onChange={(e) => setStatus(it.id, e.target.value)}
                className={`px-2 py-1 border rounded text-xs ${
                  it.status === "new"
                    ? "border-orange-300 bg-orange-50 text-orange-700"
                    : it.status === "replied"
                    ? "border-green-300 bg-green-50 text-green-700"
                    : "border-border bg-slate-50 text-slate-600"
                }`}
              >
                <option value="new">未处理</option>
                <option value="read">已查看</option>
                <option value="replied">已回复</option>
                <option value="closed">已关闭</option>
              </select>
              <button
                onClick={() => remove(it.id)}
                className="text-red-600 text-xs hover:underline"
              >
                删除
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600 mb-3">
            {it.phone ? <span>📞 {it.phone}</span> : null}
            {it.email ? <span>✉ {it.email}</span> : null}
            {it.productTitle ? (
              <span>🏷 {it.productTitle}</span>
            ) : null}
            <span className="ml-auto text-xs text-slate-400">
              {formatDate(it.createdAt)}
            </span>
          </div>
          <div className="text-sm whitespace-pre-wrap bg-slate-50 rounded p-3">
            {it.message}
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RichEditor } from "./rich-editor";

export interface NewsFormData {
  title: string;
  slug: string;
  cover: string;
  summary: string;
  content: string;
  isTop: boolean;
  visible: boolean;
  seoTitle: string;
  seoKeywords: string;
  seoDesc: string;
}

interface Props {
  initial?: Partial<NewsFormData>;
  newsId?: number;
}

export function NewsForm({ initial, newsId }: Props) {
  const router = useRouter();
  const [data, setData] = useState<NewsFormData>({
    title: initial?.title || "",
    slug: initial?.slug || "",
    cover: initial?.cover || "",
    summary: initial?.summary || "",
    content: initial?.content || "",
    isTop: initial?.isTop || false,
    visible: initial?.visible ?? true,
    seoTitle: initial?.seoTitle || "",
    seoKeywords: initial?.seoKeywords || "",
    seoDesc: initial?.seoDesc || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof NewsFormData>(k: K, v: NewsFormData[K]) {
    setData((d) => ({ ...d, [k]: v }));
  }

  async function uploadFile(file: File): Promise<string | null> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const j = await res.json();
    return j.url || null;
  }

  async function onCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = await uploadFile(f);
    if (url) set("cover", url);
    e.target.value = "";
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const url = newsId ? `/api/admin/news/${newsId}` : "/api/admin/news";
    const method = newsId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      router.push("/admin/news");
      router.refresh();
    } else {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "保存失败");
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!newsId) return;
    if (!confirm("确认删除此新闻？")) return;
    const res = await fetch(`/api/admin/news/${newsId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/news");
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-border rounded-lg p-5 space-y-4">
            <input
              required
              placeholder="新闻标题 *"
              value={data.title}
              onChange={(e) => set("title", e.target.value)}
              className="w-full px-3 py-2 border border-border rounded text-base font-semibold"
            />
            <input
              placeholder="URL slug（留空自动生成拼音）"
              value={data.slug}
              onChange={(e) => set("slug", e.target.value)}
              className="w-full px-3 py-2 border border-border rounded text-sm font-mono"
            />
            <textarea
              rows={3}
              placeholder="摘要"
              value={data.summary}
              onChange={(e) => set("summary", e.target.value)}
              className="w-full px-3 py-2 border border-border rounded text-sm"
            />
            <RichEditor
              value={data.content}
              onChange={(v) => set("content", v)}
            />
          </div>

          <div className="bg-white border border-border rounded-lg p-5 space-y-3">
            <div className="font-semibold text-sm">SEO 设置</div>
            <input
              placeholder="SEO 标题"
              value={data.seoTitle}
              onChange={(e) => set("seoTitle", e.target.value)}
              className="w-full px-3 py-2 border border-border rounded text-sm"
            />
            <input
              placeholder="SEO 关键词"
              value={data.seoKeywords}
              onChange={(e) => set("seoKeywords", e.target.value)}
              className="w-full px-3 py-2 border border-border rounded text-sm"
            />
            <textarea
              rows={2}
              placeholder="SEO 描述"
              value={data.seoDesc}
              onChange={(e) => set("seoDesc", e.target.value)}
              className="w-full px-3 py-2 border border-border rounded text-sm"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-border rounded-lg p-5 space-y-3 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={data.visible}
                onChange={(e) => set("visible", e.target.checked)}
              />
              显示在前端
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={data.isTop}
                onChange={(e) => set("isTop", e.target.checked)}
              />
              置顶
            </label>
          </div>

          <div className="bg-white border border-border rounded-lg p-5 space-y-3">
            <div className="font-semibold text-sm">封面图</div>
            {data.cover ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.cover}
                  alt=""
                  className="w-full aspect-video object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() => set("cover", "")}
                  className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white rounded text-xs"
                >
                  删除
                </button>
              </div>
            ) : (
              <label className="block w-full aspect-video border-2 border-dashed border-border rounded flex items-center justify-center cursor-pointer hover:border-primary text-sm text-slate-500">
                + 上传封面
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onCoverChange}
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {error ? (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
          {error}
        </div>
      ) : null}

      <div className="flex items-center gap-3 sticky bottom-0 bg-white border-t border-border -mx-6 px-6 py-3">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 bg-primary text-white rounded text-sm font-semibold hover:bg-blue-900 disabled:opacity-50"
        >
          {saving ? "保存中..." : newsId ? "保存修改" : "创建新闻"}
        </button>
        {newsId ? (
          <button
            type="button"
            onClick={onDelete}
            className="px-5 py-2 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50"
          >
            删除
          </button>
        ) : null}
      </div>
    </form>
  );
}

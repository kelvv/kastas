"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RichEditor } from "./rich-editor";

interface Cat {
  id: number;
  name: string;
}

export interface ProductFormData {
  id?: number;
  title: string;
  slug: string;
  categoryId: number | null;
  cover: string;
  summary: string;
  content: string;
  images: string[];
  isTop: boolean;
  isHot: boolean;
  isNew: boolean;
  visible: boolean;
  sort: number;
  seoTitle: string;
  seoKeywords: string;
  seoDesc: string;
}

interface Props {
  initial?: Partial<ProductFormData>;
  categories: Cat[];
  productId?: number;
}

export function ProductForm({ initial, categories, productId }: Props) {
  const router = useRouter();
  const [data, setData] = useState<ProductFormData>({
    title: initial?.title || "",
    slug: initial?.slug || "",
    categoryId: initial?.categoryId ?? null,
    cover: initial?.cover || "",
    summary: initial?.summary || "",
    content: initial?.content || "",
    images: initial?.images || [],
    isTop: initial?.isTop || false,
    isHot: initial?.isHot || false,
    isNew: initial?.isNew || false,
    visible: initial?.visible ?? true,
    sort: initial?.sort || 0,
    seoTitle: initial?.seoTitle || "",
    seoKeywords: initial?.seoKeywords || "",
    seoDesc: initial?.seoDesc || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof ProductFormData>(k: K, v: ProductFormData[K]) {
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

  async function onAddImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const urls: string[] = [];
    for (const f of files) {
      const u = await uploadFile(f);
      if (u) urls.push(u);
    }
    set("images", [...data.images, ...urls]);
    e.target.value = "";
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const url = productId
      ? `/api/admin/products/${productId}`
      : "/api/admin/products";
    const method = productId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    } else {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "保存失败");
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!productId) return;
    if (!confirm("确认删除此产品？")) return;
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    } else {
      alert("删除失败");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-border rounded-lg p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                产品标题 *
              </label>
              <input
                required
                value={data.title}
                onChange={(e) => set("title", e.target.value)}
                className="w-full px-3 py-2 border border-border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                URL slug{" "}
                <span className="text-xs text-slate-400">
                  （留空自动生成拼音）
                </span>
              </label>
              <input
                value={data.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="例: parker-hydraulic-seal"
                className="w-full px-3 py-2 border border-border rounded text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">摘要</label>
              <textarea
                rows={3}
                value={data.summary}
                onChange={(e) => set("summary", e.target.value)}
                className="w-full px-3 py-2 border border-border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">详情</label>
              <RichEditor
                value={data.content}
                onChange={(v) => set("content", v)}
              />
            </div>
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
              placeholder="SEO 关键词（逗号分隔）"
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
          <div className="bg-white border border-border rounded-lg p-5 space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">分类</label>
              <select
                value={data.categoryId ?? ""}
                onChange={(e) =>
                  set(
                    "categoryId",
                    e.target.value ? parseInt(e.target.value, 10) : null
                  )
                }
                className="w-full px-3 py-2 border border-border rounded text-sm"
              >
                <option value="">未分类</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 text-sm">
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
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={data.isHot}
                  onChange={(e) => set("isHot", e.target.checked)}
                />
                热门
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={data.isNew}
                  onChange={(e) => set("isNew", e.target.checked)}
                />
                推荐
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                排序值（数字越大越靠前）
              </label>
              <input
                type="number"
                value={data.sort}
                onChange={(e) => set("sort", parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-border rounded text-sm"
              />
            </div>
          </div>

          <div className="bg-white border border-border rounded-lg p-5 space-y-3">
            <div className="font-semibold text-sm">封面图</div>
            {data.cover ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.cover}
                  alt="cover"
                  className="w-full aspect-square object-cover rounded border"
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
              <label className="block w-full aspect-square border-2 border-dashed border-border rounded flex items-center justify-center cursor-pointer hover:border-primary text-sm text-slate-500">
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

          <div className="bg-white border border-border rounded-lg p-5 space-y-3">
            <div className="font-semibold text-sm">图集</div>
            <div className="grid grid-cols-3 gap-2">
              {data.images.map((u, i) => (
                <div key={i} className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={u}
                    alt=""
                    className="w-full aspect-square object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      set(
                        "images",
                        data.images.filter((_, j) => j !== i)
                      )
                    }
                    className="absolute top-1 right-1 px-1.5 py-0.5 bg-red-600 text-white rounded text-xs opacity-0 group-hover:opacity-100"
                  >
                    ×
                  </button>
                </div>
              ))}
              <label className="aspect-square border-2 border-dashed border-border rounded flex items-center justify-center cursor-pointer hover:border-primary text-xs text-slate-500">
                +
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={onAddImages}
                />
              </label>
            </div>
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
          {saving ? "保存中..." : productId ? "保存修改" : "创建产品"}
        </button>
        {productId ? (
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RichEditor } from "./rich-editor";

interface Props {
  slug: string;
  initial: {
    title: string;
    content: string;
    seoTitle: string;
    seoKeywords: string;
    seoDesc: string;
  };
}

export function PageEditor({ slug, initial }: Props) {
  const router = useRouter();
  const [data, setData] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function set<K extends keyof typeof data>(k: K, v: (typeof data)[K]) {
    setData((d) => ({ ...d, [k]: v }));
  }

  async function onSave() {
    setSaving(true);
    const res = await fetch(`/api/admin/pages/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    if (res.ok) {
      setSavedAt(new Date().toLocaleTimeString());
      router.refresh();
    } else {
      alert("保存失败");
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-border rounded-lg p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">标题</label>
          <input
            value={data.title}
            onChange={(e) => set("title", e.target.value)}
            className="w-full px-3 py-2 border border-border rounded text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">正文</label>
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

      <div className="flex items-center gap-3 sticky bottom-0 bg-white border-t border-border -mx-6 px-6 py-3">
        <button
          onClick={onSave}
          disabled={saving}
          className="px-5 py-2 bg-primary text-white rounded text-sm font-semibold hover:bg-blue-900 disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存"}
        </button>
        {savedAt ? (
          <span className="text-sm text-green-600">✓ 已保存 {savedAt}</span>
        ) : null}
      </div>
    </div>
  );
}

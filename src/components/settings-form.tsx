"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  initial: Record<string, string>;
}

const SECTIONS: { title: string; fields: { key: string; label: string; type?: "textarea" }[] }[] = [
  {
    title: "站点信息",
    fields: [
      { key: "site_name", label: "网站名称" },
      { key: "site_subtitle", label: "副标题" },
      { key: "site_keywords", label: "SEO 关键词" },
      { key: "site_desc", label: "SEO 描述", type: "textarea" },
    ],
  },
  {
    title: "首页 Hero",
    fields: [
      { key: "hero_title", label: "首页大标题" },
      { key: "hero_subtitle", label: "首页副标题" },
      { key: "hero_desc", label: "首页描述", type: "textarea" },
    ],
  },
  {
    title: "联系方式",
    fields: [
      { key: "contact_phone", label: "电话（座机）" },
      { key: "contact_mobile", label: "手机" },
      { key: "contact_email", label: "邮箱" },
      { key: "contact_qq", label: "QQ" },
      { key: "contact_address", label: "地址" },
      { key: "contact_hours", label: "营业时间" },
    ],
  },
  {
    title: "底部信息",
    fields: [
      { key: "icp", label: "ICP 备案号" },
      { key: "beian", label: "公安备案号" },
      { key: "copyright", label: "版权信息" },
    ],
  },
];

export function SettingsForm({ initial }: Props) {
  const router = useRouter();
  const [data, setData] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  async function onSave() {
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
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
    <div className="space-y-5">
      {SECTIONS.map((sec) => (
        <div
          key={sec.title}
          className="bg-white border border-border rounded-lg p-5"
        >
          <h3 className="font-semibold text-base mb-4">{sec.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sec.fields.map((f) => (
              <div
                key={f.key}
                className={f.type === "textarea" ? "md:col-span-2" : ""}
              >
                <label className="block text-sm font-medium mb-1 text-slate-700">
                  {f.label}
                </label>
                {f.type === "textarea" ? (
                  <textarea
                    rows={3}
                    value={data[f.key] || ""}
                    onChange={(e) =>
                      setData((d) => ({ ...d, [f.key]: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-border rounded text-sm"
                  />
                ) : (
                  <input
                    value={data[f.key] || ""}
                    onChange={(e) =>
                      setData((d) => ({ ...d, [f.key]: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-border rounded text-sm"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3 sticky bottom-0 bg-white border-t border-border -mx-6 px-6 py-3">
        <button
          onClick={onSave}
          disabled={saving}
          className="px-5 py-2 bg-primary text-white rounded text-sm font-semibold hover:bg-blue-900 disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存所有设置"}
        </button>
        {savedAt ? (
          <span className="text-sm text-green-600">✓ 已保存 {savedAt}</span>
        ) : null}
      </div>
    </div>
  );
}

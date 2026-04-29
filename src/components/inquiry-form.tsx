"use client";

import { useState } from "react";

export function InquiryForm({ productId }: { productId?: number }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name") as string,
      phone: fd.get("phone") as string,
      email: fd.get("email") as string,
      company: fd.get("company") as string,
      message: fd.get("message") as string,
      productId: productId ?? null,
    };
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "提交失败");
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失败");
    } finally {
      setLoading(false);
    }
  }

  if (done)
    return (
      <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-8 text-center">
        <div className="text-2xl mb-2">✓ 提交成功</div>
        <p>我们会尽快与您联系</p>
      </div>
    );

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white border border-border rounded-lg p-6 space-y-4"
    >
      <div className="grid md:grid-cols-2 gap-4">
        <Field name="name" label="姓名" required placeholder="请输入您的姓名" />
        <Field
          name="phone"
          label="手机/电话"
          required
          placeholder="便于尽快联系您"
        />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Field name="email" label="邮箱" placeholder="选填" />
        <Field name="company" label="公司" placeholder="选填" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          需求描述 <span className="text-red-500">*</span>
        </label>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="请描述您的需求：型号、数量、用途、参数等"
          className="w-full px-3 py-2 border border-border rounded focus:border-primary focus:outline-none"
        />
      </div>
      {error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-accent text-white rounded font-semibold hover:bg-orange-600 disabled:opacity-50"
      >
        {loading ? "提交中..." : "提交询价"}
      </button>
    </form>
  );
}

function Field({
  name,
  label,
  required,
  placeholder,
}: {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <input
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-border rounded focus:border-primary focus:outline-none"
      />
    </div>
  );
}

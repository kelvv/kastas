"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: fd.get("username"),
        password: fd.get("password"),
      }),
    });
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "登录失败");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <form
        onSubmit={onSubmit}
        className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold mb-1 text-center">KASTAS 后台</h1>
        <p className="text-sm text-slate-500 text-center mb-8">
          请使用管理员账号登录
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">账号</label>
            <input
              name="username"
              required
              autoFocus
              className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">密码</label>
            <input
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:border-primary"
            />
          </div>
          {error ? (
            <div className="text-sm text-red-600 text-center">{error}</div>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-primary text-white rounded font-semibold hover:bg-blue-900 disabled:opacity-50"
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Cat {
  id: number;
  name: string;
  slug: string;
  sort: number;
  isBrand: boolean;
  visible: boolean;
  cover: string | null;
  parentId: number | null;
}

interface Props {
  initial: Cat[];
}

export function CategoriesManager({ initial }: Props) {
  const router = useRouter();
  const [cats, setCats] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIsBrand, setNewIsBrand] = useState(true);

  async function reload() {
    router.refresh();
  }

  async function add() {
    if (!newName.trim()) return;
    setAdding(true);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), isBrand: newIsBrand }),
    });
    setAdding(false);
    if (res.ok) {
      setNewName("");
      reload();
    } else {
      alert("添加失败");
    }
  }

  async function update(c: Cat, patch: Partial<Cat>) {
    const merged = { ...c, ...patch };
    setCats((list) => list.map((x) => (x.id === c.id ? merged : x)));
    await fetch(`/api/admin/categories/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(merged),
    });
  }

  async function remove(id: number) {
    if (!confirm("删除分类？关联产品将变为未分类。")) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCats((list) => list.filter((c) => c.id !== id));
    } else {
      alert("删除失败");
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-border rounded-lg p-4 flex flex-wrap gap-2 items-center">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="新分类名称"
          className="px-3 py-2 border border-border rounded text-sm flex-1 min-w-48"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={newIsBrand}
            onChange={(e) => setNewIsBrand(e.target.checked)}
          />
          产品品牌分类
        </label>
        <button
          onClick={add}
          disabled={adding}
          className="px-4 py-2 bg-primary text-white rounded text-sm hover:bg-blue-900 disabled:opacity-50"
        >
          {adding ? "添加中..." : "+ 添加"}
        </button>
      </div>

      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-3 py-2 w-16">ID</th>
              <th className="px-3 py-2">名称</th>
              <th className="px-3 py-2 w-48">slug</th>
              <th className="px-3 py-2 w-20">排序</th>
              <th className="px-3 py-2 w-20">类型</th>
              <th className="px-3 py-2 w-20">显示</th>
              <th className="px-3 py-2 w-20">操作</th>
            </tr>
          </thead>
          <tbody>
            {cats.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="px-3 py-2 text-slate-400">{c.id}</td>
                <td className="px-3 py-2">
                  <input
                    value={c.name}
                    onChange={(e) =>
                      setCats((list) =>
                        list.map((x) =>
                          x.id === c.id ? { ...x, name: e.target.value } : x
                        )
                      )
                    }
                    onBlur={(e) => update(c, { name: e.target.value })}
                    className="px-2 py-1 border border-transparent rounded hover:border-border focus:border-primary outline-none w-full"
                  />
                </td>
                <td className="px-3 py-2 font-mono text-xs">
                  <input
                    value={c.slug}
                    onChange={(e) =>
                      setCats((list) =>
                        list.map((x) =>
                          x.id === c.id ? { ...x, slug: e.target.value } : x
                        )
                      )
                    }
                    onBlur={(e) => update(c, { slug: e.target.value })}
                    className="px-2 py-1 border border-transparent rounded hover:border-border focus:border-primary outline-none w-full"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={c.sort}
                    onChange={(e) =>
                      setCats((list) =>
                        list.map((x) =>
                          x.id === c.id
                            ? { ...x, sort: parseInt(e.target.value) || 0 }
                            : x
                        )
                      )
                    }
                    onBlur={(e) =>
                      update(c, { sort: parseInt(e.target.value) || 0 })
                    }
                    className="px-2 py-1 border border-transparent rounded hover:border-border focus:border-primary outline-none w-16"
                  />
                </td>
                <td className="px-3 py-2">
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={c.isBrand}
                      onChange={(e) => update(c, { isBrand: e.target.checked })}
                    />
                    品牌
                  </label>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={c.visible}
                    onChange={(e) => update(c, { visible: e.target.checked })}
                  />
                </td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => remove(c.id)}
                    className="text-red-600 hover:underline text-xs"
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

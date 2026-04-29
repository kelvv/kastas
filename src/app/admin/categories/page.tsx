import { db } from "@/lib/db";
import { AdminShell } from "@/components/admin-shell";
import { CategoriesManager } from "@/components/categories-manager";

export default async function CategoriesAdmin() {
  const cats = await db.category.findMany({
    orderBy: [{ sort: "asc" }, { id: "asc" }],
  });
  return (
    <AdminShell title="分类管理">
      <CategoriesManager
        initial={cats.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          sort: c.sort,
          isBrand: c.isBrand,
          visible: c.visible,
          cover: c.cover,
          parentId: c.parentId,
        }))}
      />
    </AdminShell>
  );
}

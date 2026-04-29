import { db } from "@/lib/db";
import { AdminShell } from "@/components/admin-shell";
import { ProductForm } from "@/components/product-form";

export default async function NewProductPage() {
  const categories = await db.category.findMany({
    where: { isBrand: true },
    orderBy: { sort: "asc" },
    select: { id: true, name: true },
  });
  return (
    <AdminShell title="新增产品">
      <ProductForm categories={categories} />
    </AdminShell>
  );
}

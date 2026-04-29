import { db } from "@/lib/db";
import { AdminShell } from "@/components/admin-shell";
import { ProductForm } from "@/components/product-form";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const pid = parseInt(id, 10);
  const [p, categories] = await Promise.all([
    db.product.findUnique({ where: { id: pid } }),
    db.category.findMany({
      where: { isBrand: true },
      orderBy: { sort: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  if (!p) notFound();
  return (
    <AdminShell title={`编辑产品 · ${p.title}`}>
      <ProductForm
        productId={p.id}
        categories={categories}
        initial={{
          title: p.title,
          slug: p.slug,
          categoryId: p.categoryId,
          cover: p.cover || "",
          summary: p.summary || "",
          content: p.content || "",
          images: Array.isArray(p.images) ? (p.images as string[]) : [],
          isTop: p.isTop,
          isHot: p.isHot,
          isNew: p.isNew,
          visible: p.visible,
          sort: p.sort,
          seoTitle: p.seoTitle || "",
          seoKeywords: p.seoKeywords || "",
          seoDesc: p.seoDesc || "",
        }}
      />
    </AdminShell>
  );
}

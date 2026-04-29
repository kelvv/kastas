import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { toSlug } from "@/lib/slug";

async function requireAuth() {
  const s = await getSession();
  return !!s.userId;
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await params;
  const pid = parseInt(id, 10);
  const body = await req.json();
  if (!body.title) {
    return NextResponse.json({ error: "标题必填" }, { status: 400 });
  }
  let slug = (body.slug || "").trim() || toSlug(body.title);
  if (!slug) slug = `product-${pid}`;
  // ensure unique (allow same id)
  let i = 2;
  let final = slug;
  while (true) {
    const exist = await db.product.findUnique({ where: { slug: final } });
    if (!exist || exist.id === pid) break;
    final = `${slug}-${i++}`;
  }

  await db.product.update({
    where: { id: pid },
    data: {
      title: body.title,
      slug: final,
      categoryId: body.categoryId || null,
      cover: body.cover || null,
      summary: body.summary || null,
      content: body.content || null,
      images: body.images || [],
      isTop: !!body.isTop,
      isHot: !!body.isHot,
      isNew: !!body.isNew,
      visible: body.visible !== false,
      sort: body.sort || 0,
      seoTitle: body.seoTitle || null,
      seoKeywords: body.seoKeywords || null,
      seoDesc: body.seoDesc || null,
    },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { id } = await params;
  await db.product.delete({ where: { id: parseInt(id, 10) } });
  return NextResponse.json({ ok: true });
}

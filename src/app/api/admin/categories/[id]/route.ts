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
  const cid = parseInt(id, 10);
  const body = await req.json();
  let slug = (body.slug || "").trim() || toSlug(body.name);
  if (!slug) slug = `cat-${cid}`;
  let i = 2;
  let final = slug;
  while (true) {
    const exist = await db.category.findUnique({ where: { slug: final } });
    if (!exist || exist.id === cid) break;
    final = `${slug}-${i++}`;
  }
  await db.category.update({
    where: { id: cid },
    data: {
      name: body.name,
      slug: final,
      sort: body.sort || 0,
      isBrand: !!body.isBrand,
      visible: body.visible !== false,
      cover: body.cover || null,
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
  const cid = parseInt(id, 10);
  // Set affected products to uncategorized
  await db.product.updateMany({
    where: { categoryId: cid },
    data: { categoryId: null },
  });
  await db.category.delete({ where: { id: cid } });
  return NextResponse.json({ ok: true });
}

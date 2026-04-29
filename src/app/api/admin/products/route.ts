import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { toSlug } from "@/lib/slug";

async function requireAuth() {
  const s = await getSession();
  return !!s.userId;
}

export async function POST(req: Request) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const body = await req.json();
  if (!body.title) {
    return NextResponse.json({ error: "标题必填" }, { status: 400 });
  }

  let slug = (body.slug || "").trim() || toSlug(body.title);
  if (!slug) slug = `product-${Date.now()}`;
  // ensure unique
  let i = 2;
  let final = slug;
  while (await db.product.findUnique({ where: { slug: final } })) {
    final = `${slug}-${i++}`;
  }

  const created = await db.product.create({
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
      publishedAt: new Date(),
    },
  });
  return NextResponse.json({ ok: true, id: created.id });
}

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
  if (!slug) slug = `news-${Date.now()}`;
  let i = 2;
  let final = slug;
  while (await db.news.findUnique({ where: { slug: final } })) {
    final = `${slug}-${i++}`;
  }
  const created = await db.news.create({
    data: {
      title: body.title,
      slug: final,
      cover: body.cover || null,
      summary: body.summary || null,
      content: body.content || null,
      isTop: !!body.isTop,
      visible: body.visible !== false,
      seoTitle: body.seoTitle || null,
      seoKeywords: body.seoKeywords || null,
      seoDesc: body.seoDesc || null,
      publishedAt: new Date(),
    },
  });
  return NextResponse.json({ ok: true, id: created.id });
}

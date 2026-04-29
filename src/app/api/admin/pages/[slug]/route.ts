import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

async function requireAuth() {
  const s = await getSession();
  return !!s.userId;
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const { slug } = await params;
  const body = await req.json();
  await db.page.upsert({
    where: { slug },
    create: {
      slug,
      title: body.title || slug,
      content: body.content || null,
      seoTitle: body.seoTitle || null,
      seoKeywords: body.seoKeywords || null,
      seoDesc: body.seoDesc || null,
    },
    update: {
      title: body.title || slug,
      content: body.content || null,
      seoTitle: body.seoTitle || null,
      seoKeywords: body.seoKeywords || null,
      seoDesc: body.seoDesc || null,
    },
  });
  return NextResponse.json({ ok: true });
}

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
  if (!body.name) {
    return NextResponse.json({ error: "名称必填" }, { status: 400 });
  }
  let slug = (body.slug || "").trim() || toSlug(body.name);
  if (!slug) slug = `cat-${Date.now()}`;
  let i = 2;
  let final = slug;
  while (await db.category.findUnique({ where: { slug: final } })) {
    final = `${slug}-${i++}`;
  }
  const created = await db.category.create({
    data: {
      name: body.name,
      slug: final,
      sort: body.sort || 0,
      isBrand: body.isBrand !== false,
      visible: body.visible !== false,
      cover: body.cover || null,
      parentId: body.parentId || null,
    },
  });
  return NextResponse.json({ ok: true, id: created.id });
}

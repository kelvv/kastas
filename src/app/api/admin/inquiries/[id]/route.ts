import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

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
  const body = await req.json();
  await db.inquiry.update({
    where: { id: parseInt(id, 10) },
    data: { status: body.status || "new" },
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
  await db.inquiry.delete({ where: { id: parseInt(id, 10) } });
  return NextResponse.json({ ok: true });
}

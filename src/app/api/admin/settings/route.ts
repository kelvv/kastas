import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidateTag } from "next/cache";

async function requireAuth() {
  const s = await getSession();
  return !!s.userId;
}

export async function PUT(req: Request) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const body = await req.json();
  const ops: Promise<unknown>[] = [];
  for (const [key, value] of Object.entries(body)) {
    if (typeof value !== "string") continue;
    ops.push(
      db.setting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      })
    );
  }
  await Promise.all(ops);
  revalidateTag("settings", "max");
  return NextResponse.json({ ok: true });
}

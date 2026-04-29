import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  const { username, password } = await req.json().catch(() => ({}));
  if (!username || !password) {
    return NextResponse.json({ error: "账号或密码不能为空" }, { status: 400 });
  }
  const user = await db.adminUser.findUnique({ where: { username } });
  if (!user) {
    return NextResponse.json({ error: "账号或密码错误" }, { status: 401 });
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "账号或密码错误" }, { status: 401 });
  }
  const session = await getSession();
  session.userId = user.id;
  session.username = user.username;
  await session.save();
  await db.adminUser.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}

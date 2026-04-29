import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const Schema = z.object({
  name: z.string().min(1).max(60),
  phone: z.string().min(1).max(40),
  email: z.string().email().optional().or(z.literal("")),
  company: z.string().max(120).optional(),
  message: z.string().min(1).max(2000),
  productId: z.number().int().nullable().optional(),
});

export async function POST(req: Request) {
  const data = await req.json().catch(() => null);
  const parsed = Schema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "参数错误", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    null;
  const ua = req.headers.get("user-agent") || null;
  const v = parsed.data;
  await db.inquiry.create({
    data: {
      name: v.name,
      phone: v.phone,
      email: v.email || null,
      company: v.company || null,
      productId: v.productId || null,
      message: v.message,
      ip,
      ua,
    },
  });
  return NextResponse.json({ ok: true });
}

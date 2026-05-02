import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const sid = Number(req.nextUrl.searchParams.get("sid"));
  if (!sid) return NextResponse.redirect(new URL("/products", req.url), 301);

  const category = await db.category.findFirst({
    where: { legacyId: sid, visible: true },
    select: { slug: true },
  });

  return NextResponse.redirect(
    new URL(category ? `/products?brand=${category.slug}` : "/products", req.url),
    301,
  );
}

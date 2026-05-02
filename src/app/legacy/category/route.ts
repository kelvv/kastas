import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const sid = Number(req.nextUrl.searchParams.get("sid"));
  let target = "/products";

  if (sid) {
    const category = await db.category.findFirst({
      where: { legacyId: sid, visible: true },
      select: { slug: true },
    });
    if (category) target = `/products?brand=${category.slug}`;
  }

  return new NextResponse(null, {
    status: 301,
    headers: { Location: target },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const cid = Number(req.nextUrl.searchParams.get("cid"));
  let target = "/products";

  if (cid) {
    const product = await db.product.findFirst({
      where: { legacyId: cid, visible: true },
      select: { slug: true },
    });
    if (product) target = `/products/${product.slug}`;
  }

  return new NextResponse(null, {
    status: 301,
    headers: { Location: target },
  });
}

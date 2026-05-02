import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const cid = Number(req.nextUrl.searchParams.get("cid"));
  if (!cid) return NextResponse.redirect(new URL("/products", req.url), 301);

  const product = await db.product.findFirst({
    where: { legacyId: cid, visible: true },
    select: { slug: true },
  });

  return NextResponse.redirect(
    new URL(product ? `/products/${product.slug}` : "/products", req.url),
    301,
  );
}

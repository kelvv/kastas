import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import sharp from "sharp";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "缺少文件" }, { status: 400 });
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const hash = crypto.createHash("sha1").update(buf).digest("hex").slice(0, 12);
  const now = new Date();
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const dir = path.join(process.cwd(), "public", "uploads", ym);
  await mkdir(dir, { recursive: true });

  const isImage = /^image\//.test(file.type);
  let filename = `${hash}_${Date.now()}`;
  let outPath: string;
  if (isImage) {
    filename += ".webp";
    outPath = path.join(dir, filename);
    await sharp(buf)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(outPath);
  } else {
    const ext = path.extname(file.name) || "";
    filename += ext;
    outPath = path.join(dir, filename);
    await writeFile(outPath, buf);
  }
  const url = `/uploads/${ym}/${filename}`;
  return NextResponse.json({ ok: true, url });
}

/**
 * 从老 Access 数据库（已导出 JSONL via mdb-json）灌入 PostgreSQL
 *
 * 用法:
 *   tsx scripts/migrate-from-access.ts <db-export-dir>
 *
 * 默认目录: ../AIWorkbench/tmp/kastas-backup/db-export/
 */
import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { pickCN } from "../src/lib/utils";
import { toSlug, uniqueSlug } from "../src/lib/slug";

const db = new PrismaClient();

const SRC_DIR =
  process.argv[2] ||
  path.resolve(
    __dirname,
    "../../AIWorkbench/tmp/kastas-backup/db-export"
  );

interface CYSort {
  S_id: number;
  S_name: string;
  S_type: string;
  S_index: number;
  S_show: number;
  S_seo_title?: string;
  S_seo_key?: string;
  S_seo_ex?: string;
}
interface CYClass {
  C_id: number;
  C_name: string;
  C_level: number;
  C_index: number;
  C_sid: number; // 顶级栏目 id
  C_show: number;
  C_tpic?: string;
}
interface CYArt {
  A_id: number;
  A_sid: number;
  A_cid: number;
  A_lanid: number; // 1=CN 2=EN
  A_index: number;
  A_title: string;
  A_top?: number;
  A_hot?: number;
  A_new?: number;
  A_tpic?: string;
  A_click?: number;
  A_uptime?: string;
  A_seo_title?: string;
  A_seo_key?: string;
  A_seo_ex?: string;
}
interface CYArtex {
  E_aid: number;
  E_lanid: number;
  E_tips?: string;
  E_content?: string;
  E_tips_allpic?: string;
  E_content_allpic?: string;
}
interface CYOpe {
  O_id: number;
  O_sid: number;
  O_lanid: number;
  O_title?: string;
  O_content?: string;
  O_uptime?: string;
}

function readJSONL<T>(file: string): T[] {
  const full = path.join(SRC_DIR, file);
  if (!fs.existsSync(full)) {
    console.warn(`! 文件不存在: ${full}`);
    return [];
  }
  return fs
    .readFileSync(full, "utf8")
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l) as T);
}

function parseDate(s?: string): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function main() {
  console.log(`📂 数据源: ${SRC_DIR}\n`);

  // 清空旧数据（开发期，方便反复跑）
  console.log("🗑  清空旧数据...");
  await db.inquiry.deleteMany();
  await db.product.deleteMany();
  await db.news.deleteMany();
  await db.page.deleteMany();
  await db.category.deleteMany();
  await db.adminUser.deleteMany();

  const slugs = new Set<string>();

  // ---------- 1. CY_Sort → Page (单页) + 保留产品/新闻栏目用 ----------
  const sorts = readJSONL<CYSort>("CY_Sort.json");
  console.log(`\n📚 顶级栏目 ${sorts.length} 个`);

  // 顶级栏目本身只起组织作用，单页类（ope）的内容在 CY_Ope
  // 产品类(gls=2) / 新闻类(art=3) / 相册类(art=10) 各自单独建分类

  // ---------- 2. CY_Ope → Page (about/contact/...) ----------
  const opes = readJSONL<CYOpe>("CY_Ope.json");
  console.log(`📄 单页 ${opes.length} 条`);
  // 只取中文版（lanid=1）
  const cnOpes = opes.filter((o) => o.O_lanid === 1);
  // sid → page slug 映射
  const sortSlugMap: Record<number, string> = {
    1: "about",
    7: "contact",
    8: "company",
    11: "culture",
    17: "jobs",
  };
  for (const o of cnOpes) {
    const slug = sortSlugMap[o.O_sid];
    if (!slug) continue;
    const sort = sorts.find((s) => s.S_id === o.O_sid);
    const title = pickCN(sort?.S_name) || slug;
    await db.page.upsert({
      where: { slug },
      create: {
        slug,
        title,
        content: o.O_content || "",
        seoTitle: pickCN(sort?.S_seo_title),
        seoKeywords: pickCN(sort?.S_seo_key),
        seoDesc: pickCN(sort?.S_seo_ex),
      },
      update: {
        title,
        content: o.O_content || "",
      },
    });
    console.log(`  ✓ Page /${slug}: ${title}`);
  }

  // ---------- 3. CY_Class → Category（分类树）----------
  const classes = readJSONL<CYClass>("CY_Class.json");
  console.log(`\n🗂  分类 ${classes.length} 个`);
  const categoryIdMap = new Map<number, number>(); // legacyId → newId

  // 排序: sid 优先（产品分类先建）
  const sorted = [...classes].sort(
    (a, b) => a.C_sid - b.C_sid || a.C_index - b.C_index
  );
  for (const c of sorted) {
    const name = pickCN(c.C_name);
    if (!name) continue;
    const isProductCat = c.C_sid === 2; // 顶级栏目 2 是产品
    const isNewsCat = c.C_sid === 3 || c.C_sid === 10;
    if (!isProductCat && !isNewsCat) continue; // 跳过不需要的

    const baseSlug = toSlug(name) || `cat-${c.C_id}`;
    const slug = uniqueSlug(baseSlug, slugs);
    const created = await db.category.create({
      data: {
        name,
        slug,
        sort: c.C_index || 0,
        cover: c.C_tpic || null,
        isBrand: isProductCat,
        visible: c.C_show !== 0,
        legacyId: c.C_id,
      },
    });
    categoryIdMap.set(c.C_id, created.id);
  }
  console.log(`  ✓ 入库 ${categoryIdMap.size} 个分类`);

  // ---------- 4. CY_Art + CY_Artex → Product / News ----------
  const arts = readJSONL<CYArt>("CY_Art.json");
  const artexs = readJSONL<CYArtex>("CY_Artex.json");
  console.log(`\n📝 文章 ${arts.length} 篇 / 详情 ${artexs.length} 行`);

  // 索引 Artex by aid + lanid=1 (中文)
  const artexMap = new Map<number, CYArtex>();
  for (const e of artexs) {
    if (e.E_lanid !== 1) continue;
    artexMap.set(e.E_aid, e);
  }

  let productCount = 0;
  let newsCount = 0;
  let skip = 0;

  for (const a of arts) {
    if (a.A_lanid && a.A_lanid !== 0 && a.A_lanid !== 1) {
      skip++;
      continue;
    }
    const title = pickCN(a.A_title);
    if (!title) {
      skip++;
      continue;
    }
    const ext = artexMap.get(a.A_id);
    const summary = ext?.E_tips || null;
    const content = ext?.E_content || null;

    const isProduct = a.A_sid === 2;
    const isNews = a.A_sid === 3 || a.A_sid === 10;
    if (!isProduct && !isNews) {
      skip++;
      continue;
    }

    const baseSlug = toSlug(title) || `item-${a.A_id}`;
    const slug = uniqueSlug(baseSlug, slugs);
    const publishedAt = parseDate(a.A_uptime);

    if (isProduct) {
      const categoryId = categoryIdMap.get(a.A_cid) || null;
      await db.product.create({
        data: {
          categoryId,
          title,
          slug,
          cover: a.A_tpic || null,
          summary,
          content,
          isTop: !!a.A_top,
          isHot: !!a.A_hot,
          isNew: !!a.A_new,
          click: a.A_click || 0,
          sort: a.A_index || 0,
          visible: true,
          seoTitle: pickCN(a.A_seo_title),
          seoKeywords: pickCN(a.A_seo_key),
          seoDesc: pickCN(a.A_seo_ex),
          legacyId: a.A_id,
          publishedAt,
        },
      });
      productCount++;
    } else {
      await db.news.create({
        data: {
          title,
          slug,
          cover: a.A_tpic || null,
          summary,
          content,
          isTop: !!a.A_top,
          click: a.A_click || 0,
          visible: true,
          seoTitle: pickCN(a.A_seo_title),
          seoKeywords: pickCN(a.A_seo_key),
          seoDesc: pickCN(a.A_seo_ex),
          legacyId: a.A_id,
          publishedAt,
        },
      });
      newsCount++;
    }
  }
  console.log(`  ✓ 产品 ${productCount} 个 / 新闻 ${newsCount} 篇 / 跳过 ${skip}`);

  // ---------- 5. 建管理员 ----------
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "kastas2026";
  await db.adminUser.create({
    data: {
      username,
      passwordHash: await bcrypt.hash(password, 10),
      name: "管理员",
      role: "admin",
    },
  });
  console.log(`\n👤 管理员: ${username} / ${password}`);

  // ---------- 6. 默认网站设置 ----------
  const settings = [
    ["site_name", "KASTAS · 加斯达密封件"],
    ["site_subtitle", "工业密封件 · 30+ 品牌一站式供应"],
    [
      "site_keywords",
      "密封件,油封,液压密封,O型圈,Parker,SKF,Trelleborg,Merkel,Kastas",
    ],
    [
      "site_desc",
      "佛山加斯达密封件，专注液压气动密封件，授权代理 Parker / SKF / Trelleborg / Merkel / 太阳铁工 等 30 余品牌。",
    ],
  ];
  for (const [k, v] of settings) {
    await db.setting.upsert({
      where: { key: k },
      create: { key: k, value: v },
      update: { value: v },
    });
  }
  console.log(`⚙️  网站设置 ${settings.length} 项已写入`);

  console.log("\n✅ 迁移完成");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

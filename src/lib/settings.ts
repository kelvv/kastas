import { db } from "./db";
import { unstable_cache } from "next/cache";

const DEFAULTS: Record<string, string> = {
  site_name: "KASTAS · 加斯达密封件",
  site_subtitle: "进口工业密封件 · 30+ 国际品牌一站式供应",
  site_keywords: "密封件,油封,液压密封,O型圈,Parker,SKF,Trelleborg,Merkel,Kastas",
  site_desc:
    "佛山加斯达密封件，专注进口液压气动密封件，授权代理 Parker / SKF / Trelleborg / Merkel / 太阳铁工 等 30 余国际品牌。",
  contact_phone: "请在后台设置",
  contact_mobile: "",
  contact_email: "info@kastas.cn",
  contact_qq: "",
  contact_address: "",
  contact_hours: "周一至周六 9:00 - 18:00",
  icp: "",
  beian: "",
  copyright: "© 2026 加斯达密封件. All Rights Reserved.",
  hero_title: "进口工业密封件",
  hero_subtitle: "30+ 国际品牌 · 一站式供应",
  hero_desc:
    "源头原装 · 全系现货 · 工程师 1V1 选型 · 24 小时交付",
};

async function fetchSettings() {
  const rows = await db.setting.findMany();
  const map: Record<string, string> = { ...DEFAULTS };
  for (const r of rows) map[r.key] = r.value;
  return map;
}

export const getSettings = unstable_cache(fetchSettings, ["settings"], {
  revalidate: 60,
  tags: ["settings"],
});

export async function getSetting(key: string) {
  const all = await getSettings();
  return all[key] ?? DEFAULTS[key] ?? "";
}

import { pinyin } from "pinyin-pro";
import slugify from "slugify";

export function toSlug(input: string): string {
  if (!input) return "";
  // 中文 → 拼音
  const py = pinyin(input, { toneType: "none", separator: " ", nonZh: "consecutive" });
  return slugify(py, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  })
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

export function uniqueSlug(base: string, existing: Set<string>): string {
  if (!existing.has(base)) {
    existing.add(base);
    return base;
  }
  let i = 2;
  while (existing.has(`${base}-${i}`)) i++;
  const next = `${base}-${i}`;
  existing.add(next);
  return next;
}

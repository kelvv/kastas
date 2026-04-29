import { db } from "@/lib/db";
import { AdminShell } from "@/components/admin-shell";
import { PageEditor } from "@/components/page-editor";

const STANDARD: Record<string, string> = {
  about: "关于我们",
  company: "公司简介",
  culture: "企业文化",
  contact: "联系我们",
  jobs: "招聘信息",
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EditPage({ params }: Props) {
  const { slug } = await params;
  const p = await db.page.findUnique({ where: { slug } });
  return (
    <AdminShell title={`编辑单页 · ${p?.title || STANDARD[slug] || slug}`}>
      <PageEditor
        slug={slug}
        initial={{
          title: p?.title || STANDARD[slug] || slug,
          content: p?.content || "",
          seoTitle: p?.seoTitle || "",
          seoKeywords: p?.seoKeywords || "",
          seoDesc: p?.seoDesc || "",
        }}
      />
    </AdminShell>
  );
}

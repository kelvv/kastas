import { AdminShell } from "@/components/admin-shell";
import { NewsForm } from "@/components/news-form";

export default async function NewNewsPage() {
  return (
    <AdminShell title="新增新闻">
      <NewsForm />
    </AdminShell>
  );
}

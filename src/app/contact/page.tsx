import { PageView } from "@/components/page-view";
export const revalidate = 60;
export const metadata = { title: "联系我们" };
export default function Page() {
  return <PageView slug="contact" />;
}

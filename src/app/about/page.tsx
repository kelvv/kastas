import { PageView } from "@/components/page-view";

export const revalidate = 60;
export const metadata = { title: "关于我们" };

export default function AboutPage() {
  return <PageView slug="about" />;
}

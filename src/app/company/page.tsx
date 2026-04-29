import { PageView } from "@/components/page-view";
export const revalidate = 60;
export const metadata = { title: "公司简介" };
export default function Page() {
  return <PageView slug="company" />;
}

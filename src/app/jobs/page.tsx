import { PageView } from "@/components/page-view";
export const revalidate = 60;
export const metadata = { title: "招聘信息" };
export default function Page() {
  return <PageView slug="jobs" />;
}

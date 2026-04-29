import { PageView } from "@/components/page-view";
export const revalidate = 60;
export const metadata = { title: "企业文化" };
export default function Page() {
  return <PageView slug="culture" />;
}

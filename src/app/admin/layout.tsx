/**
 * Admin layout 不做鉴权（login 页要能渲染）。
 * 鉴权放在每个非 login 的子页面 / API route 内。
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

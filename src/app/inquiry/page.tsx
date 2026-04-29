import { db } from "@/lib/db";
import { SiteShell } from "@/components/site-shell";
import { InquiryForm } from "@/components/inquiry-form";

export const revalidate = 60;
export const metadata = { title: "在线询价" };

interface Props {
  searchParams: Promise<{ product?: string }>;
}

export default async function InquiryPage({ searchParams }: Props) {
  const sp = await searchParams;
  const productId = sp.product ? parseInt(sp.product, 10) : null;
  const product = productId
    ? await db.product.findUnique({
        where: { id: productId },
        select: { id: true, title: true, cover: true, slug: true },
      })
    : null;

  return (
    <SiteShell>
      <div className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold">在线询价</h1>
          <p className="text-slate-300 mt-2">
            留下需求，工程师会在 24 小时内联系您
          </p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-10">
        {product ? (
          <div className="bg-muted border border-border rounded-lg p-4 mb-6 flex gap-4 items-center">
            {product.cover ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={product.cover}
                alt={product.title}
                className="w-16 h-16 object-cover rounded"
              />
            ) : null}
            <div>
              <div className="text-xs text-slate-500">咨询产品</div>
              <div className="font-semibold">{product.title}</div>
            </div>
          </div>
        ) : null}
        <InquiryForm productId={product?.id} />
      </div>
    </SiteShell>
  );
}

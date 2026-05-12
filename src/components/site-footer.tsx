import Link from "next/link";
import { getSettings } from "@/lib/settings";

export async function SiteFooter() {
  const s = await getSettings();
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="text-2xl font-black text-white mb-2">KASTAS</div>
          <p className="text-slate-400 leading-relaxed">{s.site_desc}</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">快速导航</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/products" className="hover:text-white">
                产品中心
              </Link>
            </li>
            <li>
              <Link href="/news" className="hover:text-white">
                新闻动态
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-white">
                关于我们
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white">
                联系我们
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">联系方式</h4>
          <ul className="space-y-2">
            {s.contact_phone ? <li>电话：{s.contact_phone}</li> : null}
            {s.contact_mobile ? <li>手机：{s.contact_mobile}</li> : null}
            {s.contact_email ? <li>邮箱：{s.contact_email}</li> : null}
            {s.contact_address ? <li>地址：{s.contact_address}</li> : null}
            {s.contact_hours ? <li>{s.contact_hours}</li> : null}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">关于</h4>
          <p className="text-slate-400 leading-relaxed">
            授权代理 30+ 密封件品牌，规格齐全、技术支持。
          </p>
          <Link
            href="/inquiry"
            className="inline-block mt-3 px-4 py-2 bg-accent text-white rounded hover:bg-orange-600"
          >
            在线询价
          </Link>
        </div>
      </div>
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <span>{s.copyright}</span>
          <span className="space-x-4">
            {s.icp ? (
              <a
                href="https://beian.miit.gov.cn"
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="underline underline-offset-2 text-slate-400 hover:text-white"
              >
                {s.icp}
              </a>
            ) : null}
            {s.beian ? <span>{s.beian}</span> : null}
          </span>
        </div>
      </div>
    </footer>
  );
}

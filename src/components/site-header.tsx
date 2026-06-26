import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { mainNavigation } from "@/lib/content/navigation";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand-mark" aria-label="Ledgerful home">
        <span className="brand-glyph" aria-hidden="true">
          <ShieldCheck size={19} strokeWidth={2.1} />
        </span>
        <span>Ledgerful</span>
      </Link>
      <nav className="site-nav" aria-label="Primary navigation">
        {mainNavigation.map((item) => (
          <Link href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

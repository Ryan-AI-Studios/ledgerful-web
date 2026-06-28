"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { mainNavigation } from "@/lib/content/navigation";

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="site-header">
      <Link href="/" className="brand-mark" aria-label="Ledgerful home">
        <span className="brand-glyph" aria-hidden="true">
          <ShieldCheck size={19} strokeWidth={2.1} />
        </span>
        <span>Ledgerful</span>
      </Link>
      <nav className="site-nav" aria-label="Primary navigation">
        {mainNavigation.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              href={item.href}
              key={item.href}
              aria-current={isActive ? "page" : undefined}
              className={isActive ? "nav-link-active" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
